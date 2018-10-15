-- for each file in a directory print [filename, totalLines, isBig]

summarize dir   = map files summarizer where 
                    files :async = ls dir
                    isBig number = isTrue? (> number 1000) 
                    totalLines file :async = readLines file
                    summarizer filename totalLines = list filename totalLines (isBig totalLines)

handle (summarize "c:\testdir") :with js/log

count urldata where urldata : async = fetch url

-- simple async

listFiles dir :async = ls files

--
function summarizer (dir, handler){
    fs.readDir(dir, function(err, data){
        var summary = [];
        for(var i=0;i<data.length; i++){
            fs.readLines(data[i], function(err,lines){
                summary.push(data[i].name, lines.length)
            });
        }
        handler(summary);
    })
}
summarizer("sdf", console.log);

---

get url = fetch url handler where handler res err = log res

fetch url -> getText -> count

ls dir -> map readLines -> summary where
    isBig number = isTrue? (> number 1000) 
    summary filename totalLines = list filename totalLines (isBig totalLines)

fetch1 "http://www.google.com" handler 
    where 
    handler data = fetch/text data logger  
    ,logger d = log d

do 
    (x = form1 where b1 = v2 , b2 = v3)
    (y = form2 where b1 = v3)
    (+ x y)