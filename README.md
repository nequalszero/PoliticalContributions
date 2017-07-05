# Presidential Campaign Contributions by Committee 2015-2016

## Setup
This data in this project was parsed using Ruby, which in turn outputted data as JavaScript objects.
The data was then visualized using React and D3.js.
1. To parse the raw data, run `ruby ruby_scripts/process_data.rb`.  This will create all the JavaScript objects found in the `processed_data` folder.
2. If developing further, run `npm install` to install the required node modules.
2. To start the `webpack dev server` for further development, run `npm start` to live reload upon changing `.js` and `.css` files.  In a separate console tab, `npm run sass:build -- -w` will auto compile `.scss` files to `.css`.
3. Running `webpack` will rebundle all the assets together into the `dist/bundle.js` file.
4. Opening `index.html` in the browser will display the application as of the current `bundle.js` file.

## Ruby-side Information
Most of the data processing is done in the `process_data.rb` file.  The candidate file is first parsed, looking for all candidates who are registered in the presidential race.  Once all the presidential candidates are found, all contributions made to the candidates are gathered from the candidates data file.  Lastly, all committees involved in the contributions to the candidates are parsed from the committees file.

Next, some simple statistics are calculated finding the candidates who received the most / any contributions, committees that gave the most, and the largest individual contributions.

Several writing scripts: `write_associations.rb`, `write_results.rb`, and `write_statistics.rb` are then called by `processed_data.rb` to write the Ruby data hashes to importable JavaScript objects.

## JavaScript-side Information
Note: Due to time constraints, the client side portion of this project was hastily adapted from my [SearchTesting project](searchtest)
[searchtest]: https://nequalszero.github.io/SearchTesting/
The JavaScript objects written by the Ruby side are imported into the App component, found at `frontend/components/app`.  There are only 2 main components currently, the `BarChart` and the `NavigationTabs`.  The `BarChart` itself is split into several subcomponents, the `axes`, the `chart area`, the `grid`, and the `chart` title.  The `axes` are rendered first, and `refs` to their scales are used to then create the `grid` and `chart area`.  A combination of `d3` and `React` are used to update the `DOM Tree`.

## Amusing Data Points
RIGHT TO RISE USA gave $6,666,566 to Jeb Bush.  I guess they didn't want to give another $100.

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

## Future Directions for the Project
Given additional time:
* The processed data has been formatted already to allow analysis of individual contributions on a per committee and a per candidate basis.
* Dates have been parsed into days, months, and years, which would make possible graphics on a month to month basis.
* The associations between committee types and designations have been parsed, so the relationship between lobbyist groups, corporations, etc. with presidential candidates can be visualized.
* Event handlers have been set up on the graphs, which can allow for more interactivity.  E.g. clicking on a candidate or committee could lead to another tab with more detailed contribution information.
* The current version has a hastily handrolled tooltip for displaying the bar values, it would be nice to learn how to integrate the built in `d3-tips` with `React`.
* Consider adding `Redux` as the logic in the `App` component gets more complex when more interactivity is added.
* Add styling.
