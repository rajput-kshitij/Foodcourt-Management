    var express = require('express');
    var app = express();
    var mysql = require('mysql');
    var request = require('request');
    var bodyParser = require("body-parser");
    app.use(bodyParser.urlencoded({extended:true}));

    app.set('view engine','ejs');
    var flag_invalidconsign=0;
    var cnt2=0;
    var cphone;
    var con = mysql.createConnection({
        host: "localhost",
        user: "kshitij",
        password: "abcd123",
        insecureAuth: true,
        database: "dbms"
    });


    con.connect(function(err) {
        if (err) {
            throw err;
            console.log(err);
        }
        console.log("Connected!");
    });

app.get("/",function(req,res){
    res.render("index");
});

var r=0;
app.post("/billno" , function (req, res) {


    con.query('select distinct(count(billno)) as prim from ordername',function(err,data){
        r= data[0].prim;
        r=r+1;
        // console.log(r + "inside");
        res.render("order2");
    })


})




app.get("/total" , function (req,res) {

    res.render("amount.ejs");

})


app.post("/sendorder", function (req, res) {



    con.query('select distinct(count(billno)) as prim from ordername',function(err,data){
        //r= data[0].prim;
        //r=r+1;
        // console.log(r + "inside");
        con.query(`insert into ordername values (`+r+` ,${req.body.new_item}, ${req.body.new_item2}, ${req.body.new_item3} )`, function (err,data) {

             console.log(err);
             console.log(data);

        })


    });

     res.render("order2");
})


    app.get("/emp_entry", function (req, res) {
            res.render("employee")
    })


   app.get("/cust_match",function(req,res){
    res.render("cust_match",{flag_invalidconsign:flag_invalidconsign,cnt2:cnt2});
    cnt2=0;
});
   app.get("/customer_form",function(req,res){
    res.render("customer_form");
});
app.post("/customer_form",function(req,res){
    var cname,cemail;
    cname = req.body.cname;
    cemail = req.body.cemail;
    var x = {cphone:cphone,cname:cname,cemail:cemail};
    console.log(req.body);
    console.log(cphone);
    con.query('insert into customer set ?',x, function(err, result){
    //if (err) throw err;
    //console.log(result);
    return res.redirect("/order2");
    });
});
app.get("/order2",function(req,res){
    res.render("order2");
});
app.post("/cust_match",function(req,res){
    var x = req.body.cphone;
    cphone = x;
    console.log(cphone);
    con.query('select * from customer where customer.cphone=?',[x], function(err, result){
    if(result.length == 0){
        return res.redirect("/customer_form");
    }
    else{
        return res.redirect("/order2");
    }
    });
});
app.get("/display_menu", function (req, res) {
    con.query('select rname,iname,cost from menu as m,restaurant as r,item as i where m.rid=r.rid and m.itemid=i.itemid', function(err, result){
        console.log(result);
        res.render("display_menu",{result:result});
    });
})

app.get("/view_emp", function (req, res) {
    con.query('select ename,ephone,dept from employee', function(err, result){
        console.log(result);
        res.render("view_emp",{result:result});
    });
})
    app.post("/empentry",function(req,res){

        con.query('select distinct(count(eid)) as prim from employee',function(err,data){
            r= data[0].prim;
            r=r+1;
            eid=r;
            ename = req.body.name;
            ephone = req.body.phone;
            houseno=req.body.phone;
            pincode = req.body.pincode;
            dept = req.body.dept;
            var sql = 'insert into employee set ?';
            var x = {eid:r,ename:ename,ephone:ephone,houseno:houseno,pincode:pincode,dept:dept};
            con.query(sql,x, function(err, result){
                if (err)
                    console.log(err);
                console.log(result);
            });

            res.render("employee");
        });
    });
    



app.post ("/getamount", function (req, res) {

    con.query(`select sum(cost*qty) from (ordername as o,menu as m) where (o.rid=m.rid)and(o.itemid=m.itemid)and(billno=${req.body.new_item})`, function (err,data) {
        console.log(data);
        console.log(data[0]['sum(cost*qty)']);
        res.render("amount2", {data : data});


    })

})



app.listen(7402 || process.env.PORT,function(){
    console.log("running....");
});
