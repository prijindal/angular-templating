var path = require('path')

var through = require('through2');
var Concat = require('concat-with-sourcemaps')
var gutil = require('gulp-util')
var File = gutil.File

module.exports = function(isMinify) {
    isMinify = isMinify || false
    var newLine = isMinify ? '' : '\n'

    var allStyles;
    var allTemplates;
    var allScripts;

    var getPartHtml = function(str, tag) {
        var start = str.search('<'+ tag +'>') + ('<'+tag+'>').length
        var end = str.search('</' + tag + '>')
        var tempStr = str.substring(start, end )
        if(isMinify) tempStr = tempStr.replace(/\s/g,'')
        return tempStr + newLine
    }

    doSomethingWithTheFile = function(file) {
        var contents = file.contents.toString();

        var matched = contents.match(/<dom-module id="(.*)">/)
        var elem = matched[1]

        // Script Manipulation
        var script = getPartHtml(contents, 'script')
        var returnStatement = 'return {'
        var start = script.search(returnStatement) + returnStatement.length
        script = script.substring(0, start) + "templateUrl:'" + elem + ".html',"+ script.substring(start)
        // console.log(script);
        if(!allScripts) {
            allScripts = new Concat(false, 'scripts.js', newLine)
        }

        allScripts.add(file.relative, script)


        // Styles Manipulation
        var style = getPartHtml(contents, 'style')
        var rx = /(.*) {/g
        style = style.replace(rx,elem +" $1 {")

        if(!allStyles) {
            allStyles = new Concat(false, 'styles.css', newLine)
        }

        allStyles.add(file.relative, style)


        // Template Manipulation
        var template = getPartHtml(contents, 'template')
        template = '<script type="text/ng-template" id="' + elem+ '.html">'+ newLine + template + '</script>'

        if(!allTemplates) {
            allTemplates = new Concat(false, 'templates.html', newLine)
        }

        allTemplates.add(file.relative, template)

        // Concating all of them
        contents = style.concat(template)
        contents = contents.concat(script)
        file.contents = new Buffer(contents)
        return file
    }

    var bufferContents = function(file, encoding, callback) {
        doSomethingWithTheFile(file)
        callback()
    }

    var endStream = function(callback) {
        var joinedTemplates = new File({path:path.join(__dirname,'./templates.html')})
        joinedTemplates.contents = allTemplates.content
        this.push(joinedTemplates)

        var joinedCss = new File({path:path.join(__dirname,'./styles.css')})
        joinedCss.contents = allStyles.content
        this.push(joinedCss)

        var joinedScript = new File({path:path.join(__dirname,'./scripts.js')})
        joinedScript.contents = allScripts.content
        this.push(joinedScript)

        callback()
    }

    return through.obj(bufferContents, endStream);
}
