require 'pp'
require 'csv'
require 'set'
require 'byebug'

require_relative 'write_results';
require_relative 'write_associations';
require_relative 'write_statistics';

def isNumber?(string)
  string = string[1..-1] if string[0] == "-"
  string.each_char { |char| return false unless char =~ /[0-9]/ }
  true
end

def get_file_pairings
  raw_data_directory = "raw_data/"

  {
    candidate: {
      header: "#{raw_data_directory}cn_header_file.csv",
      data: "#{raw_data_directory}cn.txt"
    },
    committee: {
      header: "#{raw_data_directory}cm_header_file.csv",
      data: "#{raw_data_directory}cm.txt"
    },
    contribution: {
      header: "#{raw_data_directory}pas2_header_file.csv",
      data: "#{raw_data_directory}itpas2.txt"
    }
  }
end

def get_column_map(header_file)
  column_map = {}

  File.open(header_file)
      .first
      .strip
      .split(',')
      .each_with_index { |col_name, idx| column_map[col_name] = idx }

  column_map
end

def process_candidate_row(line, column_map, result)
  if line[column_map['CAND_OFFICE']].upcase === 'P'
    candidate_id = line[column_map['CAND_ID']]
    candidate_name = line[column_map['CAND_NAME']]
    party = line[column_map['CAND_PTY_AFFILIATION']]

    # puts "num_commas: #{candidate_name}" if candidate_name.count(',') != 1

    result[:candidate][candidate_id] = {
      id: candidate_id,
      name: candidate_name,
      party: party,
      totalContributions: 0
    }
  end
end

def process_contribution_row(line, column_map, result)
  other_id = line[column_map['OTHER_ID']]
  candidate_id = line[column_map['CAND_ID']]

  if result[:candidate].has_key?(other_id) || result[:candidate].has_key?(candidate_id)
    committee_id = line[column_map['CMTE_ID']]
    entity_type = line[column_map['ENTITY_TP']]
    date = line[column_map['TRANSACTION_DT']] # some are blank
    amount = line[column_map['TRANSACTION_AMT']] # can be negative
    report_id = line[column_map['FILE_NUM']] # not unique
    amendment_indicator = line[column_map['AMNDT_IND']]
    fec_record_number = line[column_map['SUB_ID']] # unique

    raise "Error invalid amount '#{amount}'" unless isNumber?(amount)
    raise "Error invalid date '#{date}'" unless date.length == 8 || date.length == 0

    result[:contribution][fec_record_number] = {
      committeeId: committee_id,
      fecRecordNumber: fec_record_number,
      reportId: report_id,
      entityType: entity_type,
      date: date == '' ? '' : { month: date[0..1].to_i, day: date[2..3].to_i, year: date[4..-1].to_i },
      amount: amount.to_i,
      candidateId: candidate_id,
      otherId: other_id,
      amendmentIndicator: amendment_indicator
    }

    result[:relevant_committees].add(committee_id)
  end
end

def process_committee_row(line, column_map, result)
  committee_id = line[column_map['CMTE_ID']]

  if result[:relevant_committees].include?(committee_id)
    committee_name = line[column_map['CMTE_NM']]
    committee_designation = line[column_map['CMTE_DSGN']]
    party = line[column_map['CMTE_PTY_AFFILIATION']]
    type = line[column_map['CMTE_TP']]
    interest_group_category = line[column_map['ORG_TP']]
    candidate_id = line[column_map['CAND_ID']]

    result[:committee][committee_id] = {
      id: committee_id,
      name: committee_name,
      party: party,
      type: type,
      designation: committee_designation,
      interestGroupCategory: interest_group_category,
      candidateId: candidate_id,
      totalContributions: 0,
      endorsedCandidates: []
    }
  end
end

# Calculates the amount of contributions given by each committee and received by each
#   presidential candidate, as well as the candidates endorsed by each committee.
def calculate_contributions_per_committee(result)
  result[:contribution].each do |_, contribution|
    committee_id = contribution[:committeeId]
    candidate_id = contribution[:candidateId]
    amount = contribution[:amount]

    result[:candidate][candidate_id][:totalContributions] += amount
    result[:committee][committee_id][:totalContributions] += amount
    result[:committee][committee_id][:endorsedCandidates] << candidate_id
  end
end

def calculate_largest_contributions(result)
  result[:contribution].map { |fecRecordNumber, contribution| { id: fecRecordNumber, amount: contribution[:amount] }}
                       .sort { |a, b| b[:amount] <=> a[:amount] }
                       .take(50)
                       .map { |contribution| contribution[:id] }
end

# Find all presidential candidate ids whose contributions were greater than the threshhold, default $2000.
def find_candidates_with_contributions(result, threshhold = 2000)
  result[:candidate].map { |candidate_id, candidate| { candidate_id: candidate_id, amount: candidate[:totalContributions] } }
                    .select { |candidate| candidate[:amount] > threshhold }
                    .map { |candidate| candidate[:candidate_id] }
end

# Sorts presidential candidate ids by contribution amount.
def calculate_most_revenue_candidates(result)
  amount_proc = Proc.new { |id| result[:candidate][id][:totalContributions] }
  candidate_ids = result[:candidatesWithContributions];

  candidate_ids.sort { |a, b| amount_proc.call(b) <=> amount_proc.call(a) }
               .take(50)
end

# Sorts committee ids by contribution amount.
def calculate_most_donation_committees(result)
  result[:committee].map { |committee_id, committee| { committee_id: committee_id, amount: committee[:totalContributions] } }
                    .sort { |a, b| b[:amount] <=> a[:amount] }
                    .take(50)
                    .map { |committee| committee[:committee_id] }
end

def main
  file_pairings = get_file_pairings

  result = { candidate: {}, committee: {}, contribution: {}, relevant_committees: Set.new }
  row_procs = {
    candidate: Proc.new { |line, column_map, result| process_candidate_row(line, column_map, result) },
    contribution: Proc.new { |line, column_map, result| process_contribution_row(line, column_map, result) },
    committee: Proc.new { |line, column_map, result| process_committee_row(line, column_map, result) }
  }

  # must process files in this order
  # 1. process candidate file to get all Presidential candidates
  # 2. process contributions file grabbing all transactions related to presidential candidates
  #    and creating a set of all committee_ids involved
  # 3. process committee file to get all committees involved in presidential candidate contributions
  [:candidate, :contribution, :committee].each do |data_type|
    puts "\nprocessing #{data_type} data"

    header_file, data_file = file_pairings[data_type][:header], file_pairings[data_type][:data]

    column_map = get_column_map(header_file)
    row_proc = row_procs[data_type]

    File.open(data_file).each_with_index do |line, line_num|
      line = line.strip.split('|', -1)

      row_proc.call(line, column_map, result)
    end
  end

  calculate_contributions_per_committee(result)
  result[:largestContributions] = calculate_largest_contributions(result)
  result[:candidatesWithContributions] = find_candidates_with_contributions(result)
  result[:wealthiestCandidates] = calculate_most_revenue_candidates(result)
  result[:wealthiestCommittees] = calculate_most_donation_committees(result)

  write_results(result)
  write_associations
  write_statistics(result)
end

if __FILE__ == $PROGRAM_NAME
  main
end
