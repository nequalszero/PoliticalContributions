# Presidential Campaign Contributions by Committee 2015-2016

## Amusing Data Points
```ruby
result[:contribution].select { |key, val| val[:amount] == '6666566' }
{"4052020161292981471"=>{:committeeId=>"C00571372", :fecRecordNumber=>"4052020161292981471", :reportId=>"1073914", :entityType=>"ORG", :date=>"11042015", :amount=>"6666566", :candidateId=>"P60008059", :otherId=>"P60008059", :amendmentIndicator=>"A"}}

result[:candidate]["P60008059"]
{:id=>"P60008059", :name=>"BUSH, JEB", :party=>"REP"}
```

## Notes About the Data
### Contributions to Candidates from Committees Dataset
* Unsure of what to do with the amendment_indicator column in the contributions to candidates from committees file, for those with status `A` (amendment) and those with status `T` (termination).  
* All fec record numbers appear to be unique among the 120990 entries to Presidential candidates; the file numbers / report ids are not unique (2262 unique values).
* 119 Negative contribution amounts? 478 contribution amounts of 0?
* 604 contributions missing transaction dates.
* Unsure of how to handle OTHER_ID column of contributions file. 1368 entries do not have matching CAND_ID and OTHER_ID columns; values in both columns are not blank.

## Performance Notes
CSV module seems to run 5 times slower than manual parsing.
```ruby
# 10 seconds to run on candidate, committee, and contribution files
CSV.foreach(data_file, {col_sep: '|', quote_char: "\0"}).with_index do |line, line_num|
end

# 2 seconds to run on candidate, committee, and contribution files
File.open(data_file).each_with_index do |line, line_num|
  parsed_line = line.strip.split('|', -1)
end
```
