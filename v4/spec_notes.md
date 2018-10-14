-- for each file in a directory print [filename, totalLines, isBig]

summarize dir   = map  summarizer files where 
                    files :async = ls dir
                    isBig number = isTrue? (> number 1000) 
                    totalLines file :async = readLines file
                    summarizer filename totalLines = list filename totalLines (isBig totalLines)

handle (summarize "c:\testdir") :with js/log

-- simple async

listFiles dir :async = ls files

--

readDir("dirname", function(err,data){
    readFile(data[0], function(err,data){
        adsfadf(asdf, function(err,data){

        })
    })
})

allDirs = await readDir("dirname");
foreach file in allDirs{
    var contents = await readFile(file);
}