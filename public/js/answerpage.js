const later = document.getElementById('answer').querySelector(".display-question").innerHTML;
//console.log(later);

function answerAnonymous(questionid,userid){
  const s = document.getElementById(questionid).querySelector(".inputAnswer").querySelector(".disp-pic-ans")
  s.querySelector('.dis-pic-ua').innerHTML = '<i class="fas fa-user-circle"></i>';
  s.querySelector('.wrap').innerHTML = 'Anonymous';
  document.getElementById(questionid).querySelector(".inputAnswer").querySelector('form').action="/addAnonymousAnswer/"+questionid;
  showInputDiv(questionid);
}

function answerLater(questionid,userid){
  let ajax = new XMLHttpRequest();
  ajax.open('POST',"/addToDrafts",true);
  ajax.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  ajax.send(JSON.stringify({qid:questionid,uid:userid}));
  //console.log(document.getElementById(questionid).querySelector('.dropdown').querySelector('.drafts'));
  const e = document.getElementById(questionid).querySelector('.dropdown').querySelector('.drafts')
  e.parentElement.removeChild(e);
  alert("Added to Drafts");
}

function removeAnswerLater(questionid,userid){
  let ajax = new XMLHttpRequest();
  ajax.open('POST',"/removeFromDrafts",true);
  ajax.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  ajax.send(JSON.stringify({qid:questionid}));
  showDrafts(userid);
}



function showDrafts(userid){
  document.querySelector(".col-lg-3").querySelector(".container").querySelector(".Q-left-add-q").querySelector(".aq").style.backgroundColor="#ededed";
  document.querySelector(".col-lg-3").querySelector(".container").querySelector(".Q-left-ans-ltr").querySelector(".al").style.backgroundColor="#E99497";
  let e=document.querySelector('.display-question');
  let ajax=new XMLHttpRequest();
  ajax.open("GET","/showDrafts");
  ajax.onload = function(){
    question=JSON.parse(ajax.response);
    let str="";
    str=str+"<div class='q-title-div'><div class='q-title'>Drafts</div></div>";
    for(let i=0;i<question.length;i++){
        let date=new Date(question[i].date);
        str=str+"<div class='container border each-question' id='"+question[i]._id+"'>";
        str=str+'<i class="fas fa-times close-icon" onclick="document.getElementById("'+question[i]._id+'").style.display = '+"'"+'none'+"'"+'"></i>';
        str=str+'<div class="q-user-img">'
        if(question[i].user_dp){
          str=str+'<a href="/profile/'+question[i].user_id+'"><img class="" src="'+question[i].user_dp+'" alt="user-img"></a>';
        }
        else{
                str=str+'<img class="" src="/images/anonymous.png" alt="user-img">';
          }
        str=str+'</div>';
        str=str+'<div class="q-user-details"><p class="q-user-align-name">'+question[i].user_name+'</p></div>';
        str=str+'<p class="user-date">'+date.toLocaleDateString("en-US",{year:'numeric',month:'long',day:'numeric'})+'</p>';
        str=str+'<a href="/answers/'+question[i]._id+'"><p class="questions">'+question[i].question+'</p></a>';
        str=str+'<a href="/answers/'+question[i]._id+'"><button class="btn btn-sm "><i class="far fa-edit"></i> Answer</button></a>';
        str=str+'<div class="number-of-likes">';
        if(question[i].upvotes.length >0){
          str=str+question[i].upvotes.length;
        }
        str=str+'</div>';
        str=str+'<div class="likes">';
        if(question[i].upvotes.includes(userid)){
            str=str+'<a onclick="addLikes('+"'"+question[i]._id+"'"+','+"'"+userid+"'"+')" style="color:green" ><i class="fas fa-thumbs-up like-icon"></i></a>';
        }else{
          str=str+'<a onclick="addLikes('+"'"+question[i]._id+"'"+','+"'"+userid+"'"+')" ><i class="fas fa-thumbs-up like-icon"></i></a>';
        }
        str=str+'</div>';
        str=str+'<div class="number-of-dislikes">';
        if(question[i].downvotes.length >0){
            str=str+question[i].downvotes.length;
          }
        str=str+'</div><div class="dislikes">';
        if(question[i].downvotes.includes(userid)){
          str=str+'<a onclick="addDislikes('+"'"+question[i]._id+"'"+','+"'"+userid+"'"+')" style="color:red" ><i class="fas fa-thumbs-down dislike-icon"></i></a>';
        }else{
          str=str+'<a onclick="addDislikes('+"'"+question[i]._id+"'"+','+"'"+userid+"'"+')" ><i class="fas fa-thumbs-down dislike-icon"></i></a>';
        }
        str=str+'</div>';
        str=str+'<div class="dropdown">';
        str=str+'<p  id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-ellipsis-h"></i></p>';
        str=str+'<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">';
        str=str+'<a class="dropdown-item" href=/answers/'+question[i]._id+'">Answer Anonymously</a>';
        str=str+'<a class="dropdown-item drafts" onclick="removeAnswerLater('+"'"+question[i]._id+"'"+','+"'"+userid+"'"+')">Remove from Answer Later</a>';
        str=str+'</div></div></div>';
    };
    //console.log(str);
    e.innerHTML=str;
  }
  ajax.send();
}

function showAllQ(){
  document.querySelector(".col-lg-3").querySelector(".container").querySelector(".Q-left-add-q").querySelector(".aq").style.backgroundColor="#E99497";
  document.querySelector(".col-lg-3").querySelector(".container").querySelector(".Q-left-ans-ltr").querySelector(".al").style.backgroundColor="#ededed";
  document.querySelector(".display-question").innerHTML=later;
}
