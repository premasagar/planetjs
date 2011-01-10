/* NOTES

Google Spreadsheet:

https://spreadsheets.google.com/pub?key=0AvK94puaHj0CdEtLalVHU0llWEw4REFBcG5qZUJtUVE&hl=en_GB&single=true&gid=0&range=a2%3Aa9999


YQL query:

select * from feednormalizer where url in (select col0 from csv where url='https://spreadsheets.google.com/pub?key=0AvK94puaHj0CdEtLalVHU0llWEw4REFBcG5qZUJtUVE&hl=en_GB&single=true&gid=0&range=a2%3Aa9999&output=csv') and output='atom_1.0'


YQL URL:

http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feednormalizer%20where%20url%20in%20(select%20col0%20from%20csv%20where%20url%3D'https%3A%2F%2Fspreadsheets.google.com%2Fpub%3Fkey%3D0AvK94puaHj0CdEtLalVHU0llWEw4REFBcG5qZUJtUVE%26hl%3Den_GB%26single%3Dtrue%26gid%3D0%26range%3Da2%253Aa9999%26output%3Dcsv%26foo')%20and%20output%3D'atom_1.0'&format=json&callback=feedData
*/
    
// **

// Tim filters
(function(){
    var s = "[\\0\\t\\n\\v\\f\\r\\s]*", // whitespace characters
        scriptRegex = new RegExp("<"+s+"script[^>]*>[\\s\\S]*?<"+s+"\\/"+s+"script"+s+">", "gi"),
        idRegex = new RegExp(s+"id"+s+"="+s+"['\"]?[^'\"\\b]*['\"]?", "gi");

    tim.filter("templateAfter", function(template){
        return template
            .replace(scriptRegex, "") // Remove script tags
            .replace(idRegex, ""); // Remove id attributes
    });
}());

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

function yqlUrl(query, callbackName){
    return "http://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(query) + "&format=json&callback=" + callbackName || "?";
}

function yql(query, callbackName){
    getScript(yqlUrl(query, callbackName));
}

// **

// Callback on retrieving feed data
function feedData(data){
    // Console log the dataset
    _(data.query.results.feed);
    
    var feeds = data.query.results.feed,
        html = jQuery.map(feeds, function(feed){
            var articles = jQuery.map(feed.entry, function(entry){
                var content = (entry.content && entry.content.content) ||
                    (entry.summary && entry.summary.content) || "";
                
                return {
                    title: entry.title,
                    content: content,
                    url: entry.link.href
                };
            });
            
            return tim("feed", {
                title: feed.title,
                articles: articles,
                url: getBy(feed.link, "rel", "alternate")[0].href
            }); 
        }).join("");
    
    feedsElem.append(html);
}

// **

var spreadsheetUrl = "https://spreadsheets.google.com/pub?key=0AvK94puaHj0CdEtLalVHU0llWEw4REFBcG5qZUJtUVE&hl=en_GB&single=true&gid=0&range=a2%3Aa9999&output=csv",

    yqlQuery = "select * from feednormalizer where url in (select col0 from csv where url='" + spreadsheetUrl + "') and output='atom_1.0'",
    
    // Dom container
    feedsElem = jQuery("section.feeds");

// Get the feed dataset - uncomment the line below
// yql(yqlQuery, "feedData");

// Temporary local data
getScript("data.js");
