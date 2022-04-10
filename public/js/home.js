var date = new Date()
var time = date.getHours()
let content = document.getElementById("home").querySelector(".row").querySelector(".col-lg-6").querySelector(".Salutation").querySelector(".content")
let name = document.getElementById("modaldisplay").querySelector(".modal-body").querySelector(".q-info").innerHTML
name= name.replace('asked',' ')

if(time>=0 && time<12){
  content.innerHTML = " Good Morning "+name+" !"
}
else if(time>=12 && time<18){
  content.innerHTML = " Good Afternoon "+name+ " !"
}
else if(time>=18 && time<21){
  content.innerHTML  = " Good Evening "+name+" !"
}
else{
  content.innerHTML  = " Good Night "+name+" !"
}


let body = document.getElementById("home").querySelector(".col-lg-6").querySelector(".home-content");
let userid = document.getElementById("home").querySelector(".col-lg-6").querySelector(".Salutation").querySelector(".wrap-ask-q").querySelector(".ask-q").querySelector("input").name;
//console.log(userid);

async function getPost(){
  var ajax = new XMLHttpRequest();
  ajax.onreadystatechange = await function(){
    if(ajax.readyState == XMLHttpRequest.DONE && ajax.status == 200){
      var answers = JSON.parse(ajax.responseText);
      //console.log(answers);
      let str = " ";
      for(var i=0;i<answers.length;i++){
        //console.log(answers[i]._doc.answer.replace(/<[^>]+>/g, ''));
        ans=answers[i]._doc.answer.replace(/<[^>]+>/g, '')
        var date=new Date(answers[i]._doc.date);
        str=str+"<div class='each-questions'><div class='user-img'>";
        if(answers[i]._doc.user_dp){
          str=str+"<img src='"+answers[i]._doc.user_dp+"'>";
        }
        else{
          str=str+"<img class='' src='/images/anonymous.png' alt='user-img'>"
        }
        str=str+"</div>";
        str=str+"<div class='user-name'><p>"+answers[i]._doc.user_name+"<p></div><div class='user-date'>"+date.toLocaleDateString("en-US",{year:'numeric',month:'long',day:'numeric'})+"</p></div>";
        str=str+"<div class='question'><a href='/answers/"+answers[i]._doc.question_id+"'><p>"+answers[i].question+"</p></a></div>";
        str=str+"<div class='answer-q'><p>"+ans.substr(0,200)+".. <a href='/answers/"+answers[i]._doc.question_id+"'>(more)</a></p></div>";
        if(answers[i]._doc.images){
          str=str+"<div class='ans-img'><img src='/images/uploaded/"+answers[i]._doc.images+"'></div>";
        }
        str=str+"<div class='wrap-emotions'><div class='number-of-likes'>";
        if(answers[i]._doc.upvotes.length >0){
          str=str+answers[i]._doc.upvotes.length;
        }
        str=str+'</div><div class="likes">'
        if(answers[i]._doc.upvotes.includes(userid)){
          str=str+"<a onclick='addAnsLikes("+'"'+answers[i]._doc._id+'","'+userid+'"'+")' style='color:green' ><i class='fas fa-thumbs-up like-icon'></i></a>";
        }else{
          str=str+"<a onclick='addAnsLikes("+'"'+answers[i]._doc._id+'","'+userid+'"'+")'><i class='fas fa-thumbs-up like-icon'></i></a>"
        }
        str=str+'</div><div class="number-of-dislikes">';
        if(answers[i]._doc.downvotes.length >0){
          str=str+answers[i]._doc.downvotes.length;
        }
        str=str+'</div><div class="dislikes">';
        if(answers[i]._doc.downvotes.includes(userid)){
          str=str+"<a onclick='addAnsDislikes("+'"'+answers[i]._doc._id+'","'+userid+'"'+")' style='color:red' ><i class='fas fa-thumbs-down dislike-icon'></i></a>";
        }else{
          str=str+"<a onclick='addAnsDislikes("+'"'+answers[i]._doc._id+'","'+userid+'"'+")' ><i class='fas fa-thumbs-down dislike-icon'></i></a>";
        }
        str=str+"</div></div></div>";
      }
      body.innerHTML = str;
    }
  }
  ajax.open('GET','/getAllQuestionsAndAnswers');
  ajax.send();
}

async function getFriendsOnline(){
  var content = document.getElementById('home').querySelector('.show-stats');
  var ajax = new XMLHttpRequest();
  ajax.open('GET','/getStats');
  ajax.onreadystatechange =await  function(){
    if(ajax.readyState == XMLHttpRequest.DONE && ajax.status == 200){
      var stats = JSON.parse(ajax.response);
      var str = "<div class='stats-heading'><div class='header'>Our Stats </div><div class='l-body'>";
      str = str + "<div class='each-tag'>" + stats.users + " Users joined </div><div class='each-tag'>" + stats.answers + " Answers given</div><div class='each-tag'> " + stats.questions + " Questions Asked</div>" ;
      //console.log(stats);
      str = str+"</div></div>";
      content.innerHTML = str;

    }
  }
  ajax.send()
}

getPost();
getFriendsOnline();
