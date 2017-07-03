require 'json'

def write_JSON_data(result, field)
  puts "\nWriting #{field} JSON to file"

  File.open("processed_data/#{field}.js","w") do |f|
    f.write("const #{field} = ")
    f.write(JSON.pretty_generate(result[field]))
    f.write(";\n\n")
    f.write("export default #{field};")
  end

  puts "\nDone"
end

def write_results(result)
  [:candidate, :committee, :contribution].each { |field| write_JSON_data(result, field) }
end
