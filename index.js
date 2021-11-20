
/////////////////////  Developed by Ravi Kiran Kunsoth  /////////////////////////////////////////////////

const https = require('https');
var AWS = require("aws-sdk");
var message = "Vaccine slots are available now, please use the cowin portal to book your appointment.";
var sns = new AWS.SNS();

var today = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
var tomorrow_date = today.getDate()+ "-" +(today.getMonth()+1)+ "-" +today.getFullYear();
 

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 
 // To continuously keep receiving updates for the next day's availability every day, remove "//" in front var date on line 15 and add // on line 16 in front of var date.
 
 //var date = tomorrow_date;
 var date = "11-5-2021";
 
 /////////////// Enter the minimum age below (only 18 or 45 are accepted values)/////////////////
 
 var minimium_age = 18; 
 

// please enter your pincode below
var pincode = 781003 ;

// please visit below urls to get your distrcit ID
// first to get state id visit: *** https://cdn-api.co-vin.in/api/v2/admin/location/states ***
// to get district id remove NUM at the end of the below url and enter your state id which you got by using the above step: 
//URL to get district id: ***  https://cdn-api.co-vin.in/api/v2/admin/location/districts/NUM  ***

//please enter your district id below instead of 049
var district_id = 49 ;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


let URLforPincode ="https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode="+pincode+"&date="+date ;
let URLforDistrict ="https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id="+district_id+"&date="+date ;



exports.handler = (event, context, callback) => {
  
  console.log("tomorrow's date: "+tomorrow_date);

  
  /////// Change the URL variable below ////////////
  
  https.get(URLforDistrict,res =>{
  let body ='';
  let body1 ='';
  let body2 ='';
  let body3 ='';
  let body4 = 0;

  res.on('data' , data => {
    try{
    body = JSON.parse(data);
    //console.log(body);
    body1 = JSON.stringify(body);
    body2 = JSON.parse(body1);
    body3 = body2.sessions.length; 
    console.log("Total locations available: "+body3);
    
    for( var i = 0; i< body3 ;i++){
      if (body2.sessions[i]["min_age_limit"] == minimium_age){
        body4 += 1;
        
      }
      
    }
    console.log(body4);
    var message = "Vaccine slots are now available for the age "+minimium_age+" and above on "+date+" , please use the cowin portal to book your appointment. Number of locations available: "+body4+".";
    console.log("Total locations available based on age filter: "+body4);
    }
    catch (err) {
			console.error(err);
			
			console.log('Error response sent');
			SNSsend(message);
			
		}
    if (body4 !== 0 ) {
      SNSsend(message);
}
    
  });
  res.on('end', () => console.log(body1));

}).on('error', error => SNSsend(message));

function SNSsend(message) {
  sns.publish({
    
    //////// change SNS ARN below //////////////////////////
    
    TopicArn: "arn:aws:sns:ap-south-1:219267993905:cowin-sns",
    
    Message: JSON.stringify(message)
}, function(err, data) {
    if(err) {
        console.error('error publishing to SNS');
        context.fail(err);
    } else {
        console.info('message published to SNS');
        context.succeed(null, data);
    }
});
}
};