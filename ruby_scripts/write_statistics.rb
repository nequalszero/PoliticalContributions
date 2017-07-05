def write_largest_contributions(result)
  puts "\nWriting largestContributions to statistics.js"

  File.open("processed_data/statistics.js","w") do |f|
    f.write("export const largestContributions = ")
    f.write(JSON.pretty_generate(result[:largestContributions]))
    f.write(";\n\n")
  end

  puts "\nDone"
end

def append_wealthiest_candidates(result)
  puts "\nAppending wealthiestCandidates to statistics.js"

  File.open("processed_data/statistics.js","w") do |f|
    f.write("export const wealthiestCandidates = ")
    f.write(JSON.pretty_generate(result[:wealthiestCandidates]))
    f.write(";\n\n")
  end

  puts "\nDone"
end

def append_wealthiest_committees(result)
  puts "\nAppending wealthiestCommittees to statistics.js"

  File.open("processed_data/statistics.js","w") do |f|
    f.write("export const wealthiestCommittees = ")
    f.write(JSON.pretty_generate(result[:wealthiestCommittees]))
    f.write(";\n\n")
  end

  puts "\nDone"
end

def write_statistics(result)
  write_largest_contributions(result)
  append_wealthiest_candidates(result)
  append_wealthiest_committees(result)
end
