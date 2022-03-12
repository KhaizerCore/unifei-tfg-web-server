var XMLHttpRequest = require('xhr2');
const Http = new XMLHttpRequest();
const url = 'http://localhost:5000';
let path = '/';
let finalURL = String(url) + String(path);

var body = [
    '{{repeat(5, 7)}}',
    {
        _id: '{{objectId()}}',
        index: '{{index()}}',
        guid: '{{guid()}}',
        isActive: '{{bool()}}',
        balance: '{{floating(1000, 4000, 2, "$0,0.00")}}',
        picture: 'http://placehold.it/32x32',
        age: '{{integer(20, 40)}}',
        eyeColor: '{{random("blue", "brown", "green")}}',
        name: '{{firstName()}} {{surname()}}',
        gender: '{{gender()}}',
        company: '{{company().toUpperCase()}}',
        email: '{{email()}}',
        phone: '+1 {{phone()}}',
        address: '{{integer(100, 999)}} {{street()}}, {{city()}}, {{state()}}, {{integer(100, 10000)}}',
        about: '{{lorem(1, "paragraphs")}}',
        registered: '{{date(new Date(2014, 0, 1), new Date(), "YYYY-MM-ddThh:mm:ss Z")}}',
        latitude: '{{floating(-90.000001, 90)}}',
        longitude: '{{floating(-180.000001, 180)}}'
    }
];

Http.open("POST", finalURL);
Http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
Http.body = JSON.stringify({ "key": "value" });

let jsonData = JSON.stringify(body);
Http.send(jsonData);

Http.onreadystatechange = (e) => {
    console.log(Http.responseText);
}