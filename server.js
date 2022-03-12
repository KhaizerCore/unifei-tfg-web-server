const express = require('express');
const app = express();


// parameters( path, function(request, response, nextFunction))
app.get('/', function(req, res) {
    console.log('GET requested');

    res.render('index');

});

// defining userRouter path --> every get, set, post and delete will be in /users path
const userRouter = require('./routes/users');
app.use('/users', userRouter);


const userRouter = require('./routes/boards');
app.use('/boards', userRouter);

app.listen(5000);

/*
    GET - Retrieve an existing resource from server
    POST - Creates new resourses
    PUT - Edits an existing resource
    DELETE - Deletes an existing resource
*/


/*
    var html_content = `
            <div>
                <span>Some HTML here</span>
            </div>

            <div>
                <form name="userDetails" method="post" action="saveChanges.php">
                    <input type="text" name="firstName" value="" />
                    <input type="submit" value="save"/>
                </form>
            </div>
        `;
*/