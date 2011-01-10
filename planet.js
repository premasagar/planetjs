/* NOTES

Google Spreadsheet:

https://spreadsheets.google.com/pub?key=0AvK94puaHj0CdEtLalVHU0llWEw4REFBcG5qZUJtUVE&hl=en_GB&single=true&gid=0&range=a2%3Aa9999


CSV output:

https://spreadsheets.google.com/pub?key=0AvK94puaHj0CdEtLalVHU0llWEw4REFBcG5qZUJtUVE&hl=en_GB&single=true&gid=0&range=a2%3Aa9999&output=csv


YQL query:

select * from feednormalizer where url in (select col0 from csv where url='https://spreadsheets.google.com/pub?key=0AvK94puaHj0CdEtLalVHU0llWEw4REFBcG5qZUJtUVE&hl=en_GB&single=true&gid=0&range=a2%3Aa9999&output=csv') and output='atom_1.0'
*/


var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feednormalizer%20where%20url%20in%20(select%20col0%20from%20csv%20where%20url%3D'https%3A%2F%2Fspreadsheets.google.com%2Fpub%3Fkey%3D0AvK94puaHj0CdEtLalVHU0llWEw4REFBcG5qZUJtUVE%26hl%3Den_GB%26single%3Dtrue%26gid%3D0%26range%3Da2%253Aa9999%26output%3Dcsv%26foo')%20and%20output%3D'atom_1.0'&format=json&callback=feedData",

    // Temporary local data
    devUrl = "data.js",
    
    // Dom container
    feedsElem = jQuery("section.feeds");
    
// **

// Tim filter: Remove script tags from HTML
tim.filter("templateAfter", function(template){
    return template.replace(/<[\0\t\n\v\f\r\s]*script[^>]*>[\s\S]*?<[\0\t\n\v\f\r\s]*\/[\0\t\n\v\f\r\s]*script[\0\t\n\v\f\r\s]*>/gim, "");
});

// Pluck an object that contains a key and optional value
function getBy(enumerable, findProperty, findValue){
    return jQuery.map(enumerable, function(el){
        if (typeof el[findProperty] !== 'undefined'){
            if (typeof findValue === 'undefined' ||
                el[findProperty] === findValue){
                return el;
            }
        }
    });
}

// **

// Callback on retrieving feed data
function feedData(data){
    // Console log the dataset
    _(data.query.results.feed);
    
    var feeds = data.query.results.feed,
        html = jQuery.map(feeds, function(feed){
            var articles = jQuery.map(feed.entry, function(entry){
                var content = entry.content ? entry.content.content : entry.summary.content;
                
                return tim("article", {
                    title: entry.title,
                    content: content,
                    url: entry.link.href
                });
            }).join("");
            
            return tim("feed", {
                title: feed.title,
                articles: articles,
                url: getBy(feed.link, "rel", "alternate")[0].href
            }); 
        }).join("");
    
    feedsElem.append(html);
}

// Get the feed dataset
getScript(devUrl);
