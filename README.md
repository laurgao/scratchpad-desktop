dotTodo
=======

A simple, local todo list app by [Samson Zhang](https://twitter.com/wwsalmon)

Download [.exe for Windows](https://wwsalmon.github.io/dotTodo/dist/dotTodo%20Setup%200.1.0.exe) / [.dmg for MacOS](https://wwsalmon.github.io/dotTodo/dist/dotTodo-0.1.0.dmg)

![Screenshot of dotTodo](https://wwsalmon.github.io/dotTodo/dottodo-hero.png)

* * * * *

### Why use dotTodo?

-   No sign-ins
-   No internet needed
-   No privacy concerns
-   No bloated interfaces
-   Just lists

* * * * *

### How does it work?

dotTodo saves and opens `.todo` files, which are really just text files with markdown-style lists:

```
- [] advertise dotTodo
- [x] lgcs readings
- [] dotTodo write-up
- [] dotTodo landing page
- [] poli5 reading notes
- [] hist62 extended keyword
- [x] updately 0.8.0
- [x] lgcs revisions
- [x] updately 0.8.0 email
```

Under the hood it runs on Electron and React -- a bit overkill but this makes it easy for me, primarily a web developer, to maintain the app. Check out the [GitHub repo](https://github.com/wwsalmon/dottodo) here.

* * * * *

### Why did I make dotTodo?

-   Even with other task management and todo-list tools, I found myself making temporary markdown files with lists
-   ...and I wanted an excuse to make a pretty Electron app
-   Write-up on what I learned here (coming soon)

* * * * *

### Acknowledgements

Other projects that inspired or helped me along the way!

-   [Matthew Palmer's `.todo` spec](https://github.com/matthewpalmer/.todo)
-   [🆗 OK.css classless CSS framework](https://okcss.netlify.app/) used for landing page
-   [vite-reactts-electron-starter](https://github.com/maxstue/vite-reactts-electron-starter) used as boilerplate for Electron app