-- for each file in a directory print [filename, totalLines, isBig]

summarize dir   = map files summarizer where 
                    files :async = ls dir
                    isBig number = isTrue? (> number 1000) 
                    totalLines file :async = readLines file
                    summarizer filename totalLines = list filename totalLines (isBig totalLines)

handle (summarize "c:\testdir") :with js/log

-- simple async

listFiles dir :async = ls files

--
