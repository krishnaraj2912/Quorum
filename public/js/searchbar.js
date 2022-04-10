let searchWrapper = document.querySelector(".search-input");
let inputBar = document.querySelector("input");
let suggBar = document.querySelector(".options");

var socket = io();



function Suggestions(){
  const searched = document.getElementsByName("input")[0].value;
  //console.log(searched);
  if(searched)
  {
    const xhr = new XMLHttpRequest();
    xhr.open('GET','/questions');
    xhr.onload = function(){
      let questions = JSON.parse(xhr.response);
      const wordings=[];
      const words = questions.filter(word =>
        word.question.toLowerCase().indexOf(searched.toLowerCase()) > -1 );
        for(let i=0;i<words.length;i++)
        {
          wordings.push("<a href='/answers/"+words[i]._id+"'><li class='border'> QUESTION : "+words[i].question.toUpperCase()+"</li></a>");
        }
        const xhus = new XMLHttpRequest();
        xhus.open('GET',"/getUsers");
        xhus.onload = function(){
          let users = JSON.parse(xhus.response);
          const persons = users.filter(person =>
            person.name.toLowerCase().indexOf(searched.toLowerCase()) > -1 );
          for(let i=0;i<persons.length;i++){
            wordings.push("<a href='/profile/"+persons[i]._id+"'><li class='border'> PROFILE : "+persons[i].name.toUpperCase()+"</li></a>");
          }
          searchWrapper.classList.add("active");
          //console.log(wordings);
          showSuggestions(wordings);
        }
        xhus.send();
    }
    xhr.send();
  }
  else
  {
      searchWrapper.classList.remove("active");
  }
}


function showSuggestions(results){
  let listResult;
  if(!results.length){
      const userData = document.getElementsByName("input")[0].value;
      listResult = "<li class='border'>"+userData+"</li>";
  }else{
    //console.log(results)
    listResult = results.join("");
  }
  suggBar.innerHTML = listResult;
}

let likes = 0;

function addLikes(questionid,userid){
  //console.log(questionid,userid);

  const xhr = new XMLHttpRequest();
  xhr.open('POST','/increaseLikes',true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhr.send(JSON.stringify({value:questionid}));
  //console.log(document.querySelector('.each-question').querySelector('.likes').style);

  const xhg = new XMLHttpRequest();
  xhg.open('GET','/questions');
  xhg.onload = function(){
    let q=JSON.parse(xhg.response);
    for(var i=0;i<q.length;i++)
    {
      if(q[i]._id === questionid){
        //console.log(q[i]);
        //console.log(document.getElementById(questionid).querySelector('.number-of-likes'));
        if(q[i].upvotes.length>0){
          document.getElementById(questionid).querySelector('.number-of-likes').innerHTML = q[i].upvotes.length;
        }else{
          document.getElementById(questionid).querySelector('.number-of-likes').innerHTML = ' ';
        }
        if(q[i].upvotes.includes(userid))
        {
          //console.log(document.getElementById(questionid).querySelector('.likes').querySelector('a'));
          document.getElementById(questionid).querySelector('.likes').querySelector('a').style.color = "green";
        }
        else
        {
          //console.log(document.getElementById(questionid).querySelector('.likes').querySelector('a'));
          document.getElementById(questionid).querySelector('.likes').querySelector('a').style.color = "black";
        }


        if(q[i].downvotes.length>0){
          document.getElementById(questionid).querySelector('.number-of-dislikes').innerHTML = q[i].downvotes.length;
        }else{
          document.getElementById(questionid).querySelector('.number-of-dislikes').innerHTML = ' ';
        }
        if(q[i].downvotes.includes(userid))
        {
          //console.log(document.getElementById(questionid).querySelector('.dislikes').querySelector('a'));
          document.getElementById(questionid).querySelector('.dislikes').querySelector('a').style.color = "red";
        }
        else
        {
          //console.log(document.getElementById(questionid).querySelector('.dislikes').querySelector('a'));
          document.getElementById(questionid).querySelector('.dislikes').querySelector('a').style.color = "black";
        }
      }
    }
  }
  xhg.send();
}


function addDislikes(questionid,userid){
  //console.log(questionid,userid);

  const xhr = new XMLHttpRequest();
  xhr.open('POST','/increaseDislikes',true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhr.send(JSON.stringify({value:questionid}));
//  console.log(document.querySelector('.each-question').querySelector('.dislikes').style);

  const xhg = new XMLHttpRequest();
  xhg.open('GET','/questions');
  xhg.onload = function(){
    let q=JSON.parse(xhg.response);
    for(var i=0;i<q.length;i++)
    {
      if(q[i]._id === questionid){
        //console.log(q[i]);
        //console.log(document.getElementById(questionid).querySelector('.number-of-dislikes'));
        if(q[i].upvotes.length>0){
          document.getElementById(questionid).querySelector('.number-of-likes').innerHTML = q[i].upvotes.length;
        }else{
          document.getElementById(questionid).querySelector('.number-of-likes').innerHTML = ' ';
        }
        if(q[i].upvotes.includes(userid))
        {
          //console.log(document.getElementById(questionid).querySelector('.likes').querySelector('a'));
          document.getElementById(questionid).querySelector('.likes').querySelector('a').style.color = "green";
        }
        else
        {
          //console.log(document.getElementById(questionid).querySelector('.likes').querySelector('a'));
          document.getElementById(questionid).querySelector('.likes').querySelector('a').style.color = "black";
        }

        if(q[i].downvotes.length>0){
          document.getElementById(questionid).querySelector('.number-of-dislikes').innerHTML = q[i].downvotes.length;
        }else{
          document.getElementById(questionid).querySelector('.number-of-dislikes').innerHTML = ' ';
        }
        if(q[i].downvotes.includes(userid))
        {
          //console.log(document.getElementById(questionid).querySelector('.dislikes').querySelector('a'));
          document.getElementById(questionid).querySelector('.dislikes').querySelector('a').style.color = "red";
        }
        else
        {
          //console.log(document.getElementById(questionid).querySelector('.dislikes').querySelector('a'));
          document.getElementById(questionid).querySelector('.dislikes').querySelector('a').style.color = "black";
        }
      }
    }
  }
  xhg.send();
}

function AnonymousDiv(questionid){
  document.getElementById(questionid).querySelector('.inputAnswer').querySelector('form').action = '/addAnonymousAnswer/'+questionid;
  document.getElementById(questionid).querySelector('.inputAnswer').classList.add("active");
  document.getElementById(questionid).querySelector('.inputAnswer').querySelector('.disp-pic-ans').querySelector('p').innerHTML = 'Anonymous';
  document.getElementById(questionid).querySelector('.inputAnswer').querySelector('.disp-pic-ans').querySelector('img').src = "/images/anonymous.png";
}

function showInputDiv(questionid){
  //console.log(questionid)
  document.getElementById(questionid).querySelector('.inputAnswer').classList.add("active");
}

function clickedBold(questionid){
  document.execCommand( 'bold',false,null);
  if(document.getElementById(questionid).querySelector('.select-icon').querySelector('.bolder').style.backgroundColor == 'grey'){
    document.getElementById(questionid).querySelector('.select-icon').querySelector('.bolder').style.backgroundColor = 'white';
  }
  else{
    document.getElementById(questionid).querySelector('.select-icon').querySelector('.bolder').style.backgroundColor = 'grey';
  }
}


function clickedItalic(questionid){
  document.execCommand( 'italic',false,null);
  if(document.getElementById(questionid).querySelector('.select-icon').querySelector('.italic').style.backgroundColor == 'grey'){
    document.getElementById(questionid).querySelector('.select-icon').querySelector('.italic').style.backgroundColor = 'white';
  }
  else{
    document.getElementById(questionid).querySelector('.select-icon').querySelector('.italic').style.backgroundColor = 'grey';
  }
}

function clickedUnderline(questionid){
  document.execCommand( 'underline',false,null);
  if(document.getElementById(questionid).querySelector('.select-icon').querySelector('.underline').style.backgroundColor == 'grey'){
    document.getElementById(questionid).querySelector('.select-icon').querySelector('.underline').style.backgroundColor = 'white';
  }
  else{
    document.getElementById(questionid).querySelector('.select-icon').querySelector('.underline').style.backgroundColor = 'grey';
  }
}

function getvalue(questionid){
  document.getElementById(questionid).querySelector('.inputAnswer').querySelector('.submit-op').querySelector('button').value = document.getElementById(questionid).querySelector('.inputAnswer').querySelector('.editor').innerHTML;
  //console.log(document.getElementById(questionid).querySelector('.inputAnswer').querySelector('.submit-op').querySelector('button').value);
}


function addAnsLikes(answerid,userid){
  //console.log(answerid,userid);

  const xhr = new XMLHttpRequest();
  xhr.open('POST','/getAnsLikes',true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhr.send(JSON.stringify({value:answerid}));
//  console.log(document.querySelector('.disp-user-ans').querySelector('.ans-likes').style);

  const xhg = new XMLHttpRequest();
  xhg.open('GET','/getAnswer');
  xhg.onload = function(){
    let q=JSON.parse(xhg.response);
    for(var i=0;i<q.length;i++)
    {
      if(q[i]._id === answerid){
        //console.log(q[i]);
        //console.log(document.getElementById(answerid).querySelector('.ans-number-of-likes'));
        if(q[i].upvotes.length>0){
          document.getElementById(answerid).querySelector('.ans-number-of-likes').innerHTML = q[i].upvotes.length;
        }else{
          document.getElementById(answerid).querySelector('.ans-number-of-likes').innerHTML = ' ';
        }
        if(q[i].upvotes.includes(userid))
        {
          //console.log(document.getElementById(answerid).querySelector('.ans-likes').querySelector('a'));
          document.getElementById(answerid).querySelector('.ans-likes').querySelector('a').style.color = "green";
        }
        else
        {
          //console.log(document.getElementById(answerid).querySelector('.ans-likes').querySelector('a'));
          document.getElementById(answerid).querySelector('.ans-likes').querySelector('a').style.color = "black";
        }


        if(q[i].downvotes.length>0){
          document.getElementById(answerid).querySelector('.ans-number-of-dislikes').innerHTML = q[i].downvotes.length;
        }else{
          document.getElementById(answerid).querySelector('.ans-number-of-dislikes').innerHTML = ' ';
        }
        if(q[i].downvotes.includes(userid))
        {
          //console.log(document.getElementById(answerid).querySelector('.ans-dislikes').querySelector('a'));
          document.getElementById(answerid).querySelector('.ans-dislikes').querySelector('a').style.color = "red";
        }
        else
        {
          //console.log(document.getElementById(answerid).querySelector('.ans-dislikes').querySelector('a'));
          document.getElementById(answerid).querySelector('.ans-dislikes').querySelector('a').style.color = "black";
        }
      }
    }
  }
  xhg.send();
}


function addAnsDislikes(answerid,userid){
  //console.log(answerid,userid);

  const xhr = new XMLHttpRequest();
  xhr.open('POST','/getAnsDislikes',true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhr.send(JSON.stringify({value:answerid}));
  //console.log(document.querySelector('.disp-user-ans').querySelector('.ans-dislikes').style);

  const xhg = new XMLHttpRequest();
  xhg.open('GET','/getAnswer');
  xhg.onload = function(){
    let q=JSON.parse(xhg.response);
    for(var i=0;i<q.length;i++)
    {
      if(q[i]._id === answerid){
        //console.log(q[i]);
        //console.log(document.getElementById(answerid).querySelector('.ans-number-of-likes'));
        if(q[i].upvotes.length>0){
          document.getElementById(answerid).querySelector('.ans-number-of-likes').innerHTML = q[i].upvotes.length;
        }else{
          document.getElementById(answerid).querySelector('.ans-number-of-likes').innerHTML = ' ';
        }
        if(q[i].upvotes.includes(userid))
        {
          //console.log(document.getElementById(answerid).querySelector('.ans-likes').querySelector('a'));
          document.getElementById(answerid).querySelector('.ans-likes').querySelector('a').style.color = "green";
        }
        else
        {
          //console.log(document.getElementById(answerid).querySelector('.ans-likes').querySelector('a'));
          document.getElementById(answerid).querySelector('.ans-likes').querySelector('a').style.color = "black";
        }


        if(q[i].downvotes.length>0){
          document.getElementById(answerid).querySelector('.ans-number-of-dislikes').innerHTML = q[i].downvotes.length;
        }else{
          document.getElementById(answerid).querySelector('.ans-number-of-dislikes').innerHTML = ' ';
        }
        if(q[i].downvotes.includes(userid))
        {
          //console.log(document.getElementById(answerid).querySelector('.ans-dislikes').querySelector('a'));
          document.getElementById(answerid).querySelector('.ans-dislikes').querySelector('a').style.color = "red";
        }
        else
        {
          //console.log(document.getElementById(answerid).querySelector('.ans-dislikes').querySelector('a'));
          document.getElementById(answerid).querySelector('.ans-dislikes').querySelector('a').style.color = "black";
        }
      }
    }
  }
  xhg.send();
}

function addCmts(answerid,userid){
  const xhr = new XMLHttpRequest();
  const string = document.getElementById(answerid).querySelector('.ans-no-cmts').querySelector('textarea').value;
  xhr.open('POST','/AddCmtsPost',true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhr.send(JSON.stringify({ans_id:answerid,cmt:string}));
  //console.log(document.getElementById(answerid).querySelector('.ans-no-cmts').querySelector('textarea').value);
  document.getElementById(answerid).querySelector('.ans-no-cmts').querySelector('textarea').value="";
  dispCmts(answerid,userid);
}

function dispCmts(answerid,userid){
  const xhc = new XMLHttpRequest();
  xhc.open('GET','/getComments');
  xhc.onload = function(){
    let comments = JSON.parse(xhc.response);
    var str="";
    for(let i=0;i<comments.length;i++)
    {
      var date = new Date(comments[i].date);
      if(comments[i].ans_id == answerid){
        str = str+ "<div class='border each-cmt' id='"+comments[i]._id+"'><img src='"+comments[i].user_dp+"' alt='userimg'> <p class='username'>"+comments[i].user_name + "</p>"+
              "<p class='date'>"+date.toLocaleDateString("en-US",{year:'numeric',month:'long',day:'numeric'})+"</p>"+
              "<p class='body'>"+comments[i].content+"</p>"+
              "<div class='cmts-number-of-likes'>";
        if(comments[i].upvotes.length >0)
        {
            str=str+comments[i].upvotes.length;
        }
        str=str+"</div>"+"<div class='cmts-likes'>";

        if(comments[i].upvotes.includes(userid))
        {
          str=str+"<a onclick='addCmtsLikes("+'"'+ comments[i]._id +'"'+","+'"'+ userid+'"'+")' style='color:green' ><i class='fas fa-thumbs-up like-icon'></i></a>";
        }
        else
        {
          str=str+"<a onclick='addCmtsLikes("+'"'+ comments[i]._id +'"'+","+'"'+ userid+'"'+")' ><i class='fas fa-thumbs-up like-icon'></i></a>";
        }
        str=str+" </div>"+"<div class='cmts-number-of-dislikes'>";
        if(comments[i].downvotes.length >0)
        {
            str=str+comments[i].downvotes.length;
        }
        str=str+"</div>"+"<div class='cmts-dislikes'>";

        if(comments[i].downvotes.includes(userid))
        {
          str=str+"<a onclick='addCmtsdisLikes("+'"'+ comments[i]._id +'"'+","+'"'+ userid+'"'+")' style='color:red' ><i class='fas fa-thumbs-down dislike-icon'></i></a>";
        }
        else
        {
          str=str+"<a onclick='addCmtsdisLikes("+'"'+ comments[i]._id +'"'+","+'"'+ userid+'"'+")' ><i class='fas fa-thumbs-down dislike-icon'></i></a>";
        }
        str=str+"</div>";
        str=str+"<div class='dropdown'><p  id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'><i class='fas fa-ellipsis-h'></i></p>";
        str=str+"<div class='dropdown-menu' aria-labelledby='dropdownMenuButton'><a class='dropdown-item' onclick='deleteComment("+'"'+ comments[i]._id +'"'+','+'"'+ answerid +'"'+','+'"'+ userid +'"'+")'>Delete</a></div>";
        str=str+"</div></div>";
      }
    }
    document.getElementById(answerid).querySelector(".show-prev-cmts").innerHTML = str;
  }
  xhc.send();
}

function deleteComment(commentsid,answerid,userid){
  const ajax = new XMLHttpRequest();
  ajax.open('POST','/deleteComments',true);
  ajax.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  ajax.send(JSON.stringify({comment_id:commentsid}));
  dispCmts(answerid,userid);
}

function addCmtsLikes(commentsid,userid){
  //console.log(commentsid,userid);

  const xhr = new XMLHttpRequest();
  xhr.open('POST','/getCommentsLikes',true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhr.send(JSON.stringify({value:commentsid}));

  const xhg = new XMLHttpRequest();
  xhg.open('GET','/getComments');
  xhg.onload = function(){
    let q=JSON.parse(xhg.response);
    for(var i=0;i<q.length;i++)
    {
      if(q[i]._id === commentsid){
        //console.log(q[i]);
        //console.log(document.getElementById(commentsid).querySelector('.cmts-number-of-likes'));
        if(q[i].upvotes.length>0){
          document.getElementById(commentsid).querySelector('.cmts-number-of-likes').innerHTML = q[i].upvotes.length;
        }else{
          document.getElementById(commentsid).querySelector('.cmts-number-of-likes').innerHTML = ' ';
        }
        if(q[i].upvotes.includes(userid))
        {
          //console.log(document.getElementById(commentsid).querySelector('.cmts-likes').querySelector('a'));
          document.getElementById(commentsid).querySelector('.cmts-likes').querySelector('a').style.color = "green";
        }
        else
        {
          //console.log(document.getElementById(commentsid).querySelector('.cmts-likes').querySelector('a'));
          document.getElementById(commentsid).querySelector('.cmts-likes').querySelector('a').style.color = "black";
        }


        if(q[i].downvotes.length>0){
          document.getElementById(commentsid).querySelector('.cmts-number-of-dislikes').innerHTML = q[i].downvotes.length;
        }else{
          document.getElementById(commentsid).querySelector('.cmts-number-of-dislikes').innerHTML = ' ';
        }
        if(q[i].downvotes.includes(userid))
        {
          //console.log(document.getElementById(commentsid).querySelector('.cmts-dislikes').querySelector('a'));
          document.getElementById(commentsid).querySelector('.cmts-dislikes').querySelector('a').style.color = "red";
        }
        else
        {
          //console.log(document.getElementById(commentsid).querySelector('.cmts-dislikes').querySelector('a'));
          document.getElementById(commentsid).querySelector('.cmts-dislikes').querySelector('a').style.color = "black";
        }
      }
    }
  }
  xhg.send();
}


function addCmtsdisLikes(commentsid,userid){
  //console.log(commentsid,userid);

  const xhr = new XMLHttpRequest();
  xhr.open('POST','/getCommentsdisLikes',true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhr.send(JSON.stringify({value:commentsid}));

  const xhg = new XMLHttpRequest();
  xhg.open('GET','/getComments');
  xhg.onload = function(){
    let q=JSON.parse(xhg.response);
    for(var i=0;i<q.length;i++)
    {
      if(q[i]._id === commentsid){
        //console.log(q[i]);
        ////console.log(document.getElementById(commentsid).querySelector('.cmts-number-of-likes'));
        if(q[i].upvotes.length>0){
          document.getElementById(commentsid).querySelector('.cmts-number-of-likes').innerHTML = q[i].upvotes.length;
        }else{
          document.getElementById(commentsid).querySelector('.cmts-number-of-likes').innerHTML = ' ';
        }
        if(q[i].upvotes.includes(userid))
        {
          //console.log(document.getElementById(commentsid).querySelector('.cmts-likes').querySelector('a'));
          document.getElementById(commentsid).querySelector('.cmts-likes').querySelector('a').style.color = "green";
        }
        else
        {
          //console.log(document.getElementById(commentsid).querySelector('.cmts-likes').querySelector('a'));
          document.getElementById(commentsid).querySelector('.cmts-likes').querySelector('a').style.color = "black";
        }


        if(q[i].downvotes.length>0){
          document.getElementById(commentsid).querySelector('.cmts-number-of-dislikes').innerHTML = q[i].downvotes.length;
        }else{
          document.getElementById(commentsid).querySelector('.cmts-number-of-dislikes').innerHTML = ' ';
        }
        if(q[i].downvotes.includes(userid))
        {
          //console.log(document.getElementById(commentsid).querySelector('.cmts-dislikes').querySelector('a'));
          document.getElementById(commentsid).querySelector('.cmts-dislikes').querySelector('a').style.color = "red";
        }
        else
        {
          //console.log(document.getElementById(commentsid).querySelector('.cmts-dislikes').querySelector('a'));
          document.getElementById(commentsid).querySelector('.cmts-dislikes').querySelector('a').style.color = "black";
        }
      }
    }
  }
  xhg.send();
}

function invokeDel(answerid){
  change = document.getElementById(answerid);
  let str="<div class='deleted-ans'><p><i class=' trash fas fa-trash-alt'></p></i><p class='your-a-deleted'>This question is deleted</p></div>";
  change.innerHTML=str;
  const ajax=new XMLHttpRequest();
  ajax.open('POST','/deleteAnswer',true);
  ajax.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  ajax.send(JSON.stringify({ans_id:answerid}));
}



function addFriend(userid,friendid){
  //console.log(userid,friendid);
  document.getElementById('profile').querySelector('.profile-info').querySelector('.add-button').innerHTML = "Requested";
  const xhf = new XMLHttpRequest();
  xhf.open('POST','/addFriend',true);
  xhf.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhf.send(JSON.stringify({reqsent:userid,reqgot:friendid}));
}


function removeFriend(userid,friendid){
  //console.log(userid,friendid);
  document.getElementById('profile').querySelector('.profile-info').querySelector('.remove-button').innerHTML = "Add";
  const xhf = new XMLHttpRequest();
  xhf.open('POST','/removeFriend',true);
  xhf.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhf.send(JSON.stringify({userid:userid,friendid:friendid}));
}

function unFriend(userid,friendid){
  const xhf = new XMLHttpRequest();
  xhf.open('POST','/removeFriend',true);
  xhf.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhf.send(JSON.stringify({userid:userid,friendid:friendid}));
  viewUserFriends(userid);
}


function acceptRequest(userid){
  //console.log(userid);
  const xhar = new XMLHttpRequest();
  const url = "/particularNotifications/"+userid;
  xhar.open('GET',url);
  xhar.onload = function(){
    let requests=JSON.parse(xhar.response);
    let str="";
    if(requests.length == 0){
      str= str+'<div class="show-requests"><p>No Requests</p></div>';
    }
    else{
      for(let i=0;i<requests.length;i++){
        str=str+'<div class="show-requests"><a href="/profile/'+requests[i].from+'"><img src="'+requests[i].fromphoto+' "></a><p class="requested-user">'+requests[i].fromName+'</p>';
        str=str+'<button class="btn btn-success btn-sm accept" onclick="friendAccepted('+"'"+requests[i].from+"'"+','+"'"+requests[i].to+"'"+')">Accept</button><button class="btn btn-danger btn-sm decline" onclick="friendDeclined('+"'"+requests[i].from+"'"+','+"'"+requests[i].to+"'"+')">Decline</button></div>';
      }
    }
    document.getElementById('chat').querySelector('.messaging-space').innerHTML = str;
  }
  xhar.send();
}


function viewUserFriends(userid){
  //console.log(userid);
  const xhvf = new XMLHttpRequest();
  const url = "/getFriendsOfUser/"+userid;
  xhvf.open('GET',url);
  xhvf.onload = function(){
    let requests=JSON.parse(xhvf.response);
    //console.log(requests);
    let str="";
    if(requests.length == 0){
      str= str+'<div class="show-requests"><p>No Friends</p></div>';
    }
    else{
      for(let i=0;i<requests.length;i++){
        let image = requests[i].fromphoto;
        let friendid = requests[i].from;
        let friendname = requests[i].fromName;
        if(requests[i].to != userid){
          image = requests[i].tophoto;
          friendid = requests[i].to;
          friendname = requests[i].toName;
        }
        str=str+'<div class="show-friends"><a href="/profile/'+friendid+'"><img src="'+image+' "></a><p class="requested-user">'+friendname+'</p>';
        str=str+'<button class="btn btn-primary btn-sm unfriend" onclick ="unFriend('+"'"+userid+"'"+","+"'"+friendid+"'"+')" >Unfriend</button></div>';
      }
    }
    document.getElementById('chat').querySelector('.messaging-space').innerHTML = str;
  }
  xhvf.send();
}

var selectedFriend = "";

function viewChats(userid){
  //console.log(userid);
  const xhvf = new XMLHttpRequest();
  const url = "/getFriendsOfUser/"+userid;
  xhvf.open('GET',url);
  xhvf.onload = function(){
    let requests=JSON.parse(xhvf.response);
    //console.log(requests);
    let str='<div class="inbox-names"><div class="inbox-index-title"><p> ALL MESSAGES</p></div>';
    if(requests.length == 0){
      str= str+'<div class="show-chats-friends"><p>No Chats</p></div>';
    }
    else{
      for(let i=0;i<requests.length;i++){
        let image = requests[i].fromphoto;
        let friendid = requests[i].from;
        let friendname = requests[i].fromName;
        if(requests[i].to != userid){
          image = requests[i].tophoto;
          friendid = requests[i].to;
          friendname = requests[i].toName;
        }

        str=str+'<div class="show-chat-friends" onclick="showChats('+"'"+friendid+"'"+","+"'"+friendname+"'"+','+"'"+image+"'"+','+"'"+userid+"'"+')"><img src="'+image+' "><p class="requested-user">'+friendname+'</p></div>';
      }
    }
    str=str+'</div>';
    str=str+'<div class="user-friend-chat"></div>';
    document.getElementById('chat').querySelector('.messaging-space').innerHTML = str;
    connectSocket(userid);
  }
  xhvf.send();
}

function showChats(friendid,friendname,friendimg,userid){
  //console.log(friendid);
  //console.log(friendname);
  //console.log(friendimg);
  //console.log(userid);
  selectedFriend = friendid;
  let str = '<div class="chatting-friend-det"><img src="'+friendimg+'"><p>'+friendname+'</p></div>';
  const xhc = new XMLHttpRequest();
  const url = "/getPrivateMessages/"+friendid;
  xhc.open('GET',url);
  xhc.onload = function(){
    let messages = JSON.parse(xhc.response);
    //console.log(messages);
    let f=0;
    str=str+'<div class="chat-area" id="'+friendid+'">';
    var dateString = "";
    for(let i=0;i<messages.length;i++){
      var date= new Date(messages[i].date);
      //console.log(date);

      if(messages[i].to == userid && messages[i].from == friendid){
        //console.log(messages[i].message)
        if(f==0){
          dateString = date.toLocaleDateString("en-US",{year:'numeric',month:'long',day:'numeric'});
          str=str+'<div class="chat-date"><div class="date"><p>'+dateString+'</p></div></div>';
        }
        f=1;
        if(dateString != date.toLocaleDateString("en-US",{year:'numeric',month:'long',day:'numeric'})){
          dateString = date.toLocaleDateString("en-US",{year:'numeric',month:'long',day:'numeric'});
          str=str+'<div class="chat-date"><div class="date"><p>'+dateString+'</p></div></div>';

        }
        str=str+'<div class="message-from-friend"><div class="message"><p>'+messages[i].message+'</p></div></div>';
      }else if(messages[i].to == friendid && messages[i].from == userid){
        //console.log(messages[i].message)
        //console.log(messages[i].date)
        if(f==0){
          dateString = date.toLocaleDateString("en-US",{year:'numeric',month:'long',day:'numeric'});
          str=str+'<div class="chat-date"><div class="date"><p>'+dateString+'</p></div></div>';
        }
        f=1;
        if(dateString != date.toLocaleDateString("en-US",{year:'numeric',month:'long',day:'numeric'})){
          dateString = date.toLocaleDateString("en-US",{year:'numeric',month:'long',day:'numeric'});
          str=str+'<div class="chat-date"><div class="date"><p>'+dateString+'</p></div></div>';
        }
        str=str+'<div class="message-from-you"><div class="message"><p>'+messages[i].message+'</p></div></div>';
      }
    }
    if(f==0){
      str=str+'<div class="common-no-message"><p> Messages will appear once you send/receive them</p></div>';
    }
    str=str+'</div>';
    str=str+'<div class="user-message-chatbox"><textarea name="msg-chatbox"></textarea><button class="btn btn-sm btn-primary" onclick="addComposedMessage('+"'"+userid+"'"+','+"'"+friendid+"'"+","+"'"+friendname+"'"+","+"'"+friendimg+"'"+')"><i class="fas fa-paper-plane"></i></button></div>';
    document.getElementById('chat').querySelector('.messaging-space').querySelector(".user-friend-chat").innerHTML=str;
    var obj = document.getElementById('chat').querySelector('.messaging-space').querySelector(".user-friend-chat").querySelector(".chat-area");
    obj.scrollTop = obj.scrollHeight;
  }
  xhc.send();
}

function friendAccepted(fromid,toid){
  const xhf = new XMLHttpRequest();
  xhf.open('POST','/friendRequestAccepted',true);
  xhf.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhf.send(JSON.stringify({fromid:fromid,toid:toid}));
  acceptRequest(toid);
}

function friendDeclined(fromid,toid){
  const xhf = new XMLHttpRequest();
  xhf.open('POST','/friendRequestDeleted',true);
  xhf.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhf.send(JSON.stringify({fromid:fromid,toid:toid}));
  acceptRequest(toid);
}

function addComposedMessage(userid,friendid,friendname,friendimg){
  let message = document.getElementById('chat').querySelector('.messaging-space').querySelector('.user-friend-chat').querySelector('.user-message-chatbox').querySelector('textarea').value;
  if(message[0]!=' '){
    //console.log(message);
    const xhf = new XMLHttpRequest();
    xhf.open('POST','/addChatMessage',true);
    xhf.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xhf.send(JSON.stringify({fromid:userid,toid:friendid,content:message}));
    showChats(friendid,friendname,friendimg,userid);
  }else{
    document.getElementById('chat').querySelector('.messaging-space').querySelector('.user-friend-chat').querySelector('.user-message-chatbox').querySelector('textarea').value=" ";
  }
}

function connectSocket(userid){
  //console.log("connect socket working ",userid);
  var ajax= new XMLHttpRequest();
  ajax.open("POST","/connectSocket",true);
  ajax.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  ajax.send(JSON.stringify({userid:userid}));
  //console.log(selectedFriend);
}

socket.on("messageReceived",function(messageObj){
  if(selectedFriend!="" && selectedFriend == messageObj.from){
    var str='<div class="message-from-friend"><p>'+messageObj.message+'</p></div>';
    document.getElementById(selectedFriend).innerHTML+=str;

    var obj = document.getElementById(selectedFriend);
    obj.scrollTop = obj.scrollHeight;
}
});



//for Profile


function showProfile(){
  const userid = document.getElementById('profile').querySelector('.profile-stats').querySelector('.friend').value;
  const loggeduserid = document.getElementById('profile').querySelector('.profile-stats').querySelector('.user').value;
  const numBar =  document.getElementById('profile').querySelector('.profile-stats');
  const q = numBar.querySelector('.questions').querySelector('p').innerHTML;
  const a = numBar.querySelector('.answers').querySelector('p').innerHTML;
  const f = numBar.querySelector('.friends').querySelector('p').innerHTML;
  //console.log(q,a,f);

  var str='<div class="showQ"> Your Activity</div>';
  str=str+"<div class='each-question'>";
  str=str+"<div class='question'><p>You have asked "+ q +"</p></div></div>";
  str=str+"<div class='each-question'>";
  str=str+"<div class='question'><p>You have provided "+ a +"</p></div></div>";
  str=str+"<div class='each-question'>";
  str=str+"<div class='question'><p>You have "+ f +"</p></a></div></div>";
    document.getElementById('profile').querySelector('.selected-body').innerHTML=str;
}


function showUserQ(){
  const userid = document.getElementById('profile').querySelector('.profile-stats').querySelector('.friend').value;
  const loggeduserid = document.getElementById('profile').querySelector('.profile-stats').querySelector('.user').value;
  const numBar =  document.getElementById('profile').querySelector('.profile-stats');
  var ajax = new XMLHttpRequest();
  ajax.open('GET','/UserQuestions/'+userid);
  ajax.onload = function(){
    var questions = JSON.parse(ajax.response);
    var str='<div class="showQ">'+questions.length+' Questions</div>';
    for(var i=0;i<questions.length;i++)
    {

      var date=new Date(questions[i].date);
      str=str+"<div class='each-question'><div class='user-img'><img src='"+questions[i].user_dp+"'></div><div class='user-name'><p>"+questions[i].user_name+"<p></div><div class='user-date'>"+date.toLocaleDateString("en-US",{year:'numeric',month:'long',day:'numeric'})+"</p></div>";
      str=str+"<div class='question'><a href='/answers/"+questions[i]._id+"'><p>"+questions[i].question+"</p></a></div>";
      if(loggeduserid == questions[i].user_id){
        str=str+"<div class='dropdown'><p  id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'><i class='fas fa-ellipsis-h'></i></p>";
        str=str+"<div class='dropdown-menu' aria-labelledby='dropdownMenuButton'><a class='dropdown-item' onclick='deleteQuestion("+'"'+questions[i]._id+'"'+")'>Delete</a></div></div></div>";
      }else{
        str=str+'</div>';
      }
    }
    document.getElementById('profile').querySelector('.selected-body').innerHTML=str;

  }
  ajax.send();
}


function showUserAns(){
  const userid = document.getElementById('profile').querySelector('.profile-stats').querySelector('.friend').value;
  const loggeduserid = document.getElementById('profile').querySelector('.profile-stats').querySelector('.user').value;
  const numBar =  document.getElementById('profile').querySelector('.profile-stats');
  var ajax = new XMLHttpRequest();
  ajax.open('GET','/UserAnswers/'+userid);
  ajax.onload = async function(){
    var answers = JSON.parse(ajax.response);
    var str='<div class="showQ">'+answers.length+' Answers</div>';

    for(var i=0;i<answers.length;i++)
    {
      var date=new Date(answers[i]._doc.date);
      str=str+"<div class='each-question'><div class='user-img'><img src='"+answers[i]._doc.user_dp+"'></div><div class='user-name'><p>"+answers[i]._doc.user_name+"<p></div><div class='user-date'>"+date.toLocaleDateString("en-US",{year:'numeric',month:'long',day:'numeric'})+"</p></div>";
      str=str+"<div class='question'><a href='/answers/"+answers[i]._doc.question_id+"'><p>"+answers[i].question+"</p></a></div>";
      str=str+"<div class='answer-q'><p>"+answers[i]._doc.answer+"</p></div>";
      if(loggeduserid == answers[i]._doc.user_id){
        str=str+"<div class='dropdown'><p  id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'><i class='fas fa-ellipsis-h'></i></p>";
        str=str+"<div class='dropdown-menu' aria-labelledby='dropdownMenuButton'><a class='dropdown-item' onclick='deleteAnswer("+'"'+answers[i]._doc._id+'"'+")'>Delete</a></div></div></div>";
      }else{
        str=str+'</div>';
      }
    }
    document.getElementById('profile').querySelector('.selected-body').innerHTML=str;

  }
  ajax.send();
}

function showUserFriends(){
  const userid = document.getElementById('profile').querySelector('.profile-stats').querySelector('.friend').value;
  const loggeduserid = document.getElementById('profile').querySelector('.profile-stats').querySelector('.user').value;
  const numBar =  document.getElementById('profile').querySelector('.profile-stats');
  //console.log(userid);
  const ajax = new XMLHttpRequest();
  const url = "/getFriendsOfUser/"+userid;
  ajax.open('GET',url);
  ajax.onload = function(){
    let requests=JSON.parse(ajax.response);
    //console.log(requests);
    let str="<div class='showQ'>"+requests.length+" Friends</div>";
    if(requests.length == 0){
      str= str+'<div class="show-user-fri-c"><div class="show-requests"><p>No Friends</p></div></div>';
    }
    else{
      for(let i=0;i<requests.length;i++){
        let image = requests[i].fromphoto;
        let friendid = requests[i].from;
        let friendname = requests[i].fromName;
        if(requests[i].to != userid){
          image = requests[i].tophoto;
          friendid = requests[i].to;
          friendname = requests[i].toName;
        }
        str=str+'<div class="show-user-fri-c"><div class="show-friends"><a href="/profile/'+friendid+'"><img src="'+image+' "></a><p class="requested-user">'+friendname+'</p>';
        str=str+'</div></div>';
      }
    }
    str=str+"</div>";
    document.getElementById('profile').querySelector('.selected-body').innerHTML= str;
  }
  ajax.send();
}

function deleteQuestion(questionid){
  const userid = document.getElementById('profile').querySelector('.profile-stats').querySelector('.friend').value;
  const loggeduserid = document.getElementById('profile').querySelector('.profile-stats').querySelector('.user').value;
  const numBar =  document.getElementById('profile').querySelector('.profile-stats');
  const xhf = new XMLHttpRequest();
  xhf.open('POST','/deleteQuestion',true);
  xhf.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhf.send(JSON.stringify({id:questionid}));
  cnt = Number(numBar.querySelector('.questions').querySelector('p').innerHTML.substr(0,2))-1;
  numBar.querySelector('.questions').querySelector('p').innerHTML = cnt.toString() + " Questions";
  showUserQ();
}

function deleteAnswer(questionid){
  //console.log(questionid)
  const userid = document.getElementById('profile').querySelector('.profile-stats').querySelector('.friend').value;
  const loggeduserid = document.getElementById('profile').querySelector('.profile-stats').querySelector('.user').value;
  const numBar =  document.getElementById('profile').querySelector('.profile-stats');
  const xhf = new XMLHttpRequest();
  xhf.open('POST','/deleteAnswer',true);
  xhf.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhf.send(JSON.stringify({ans_id:questionid}));
  cnt = Number(numBar.querySelector('.answers').querySelector('p').innerHTML.substr(0,2))-1;
  numBar.querySelector('.answers').querySelector('p').innerHTML = cnt.toString() + " Answers";
  //console.log(cnt);

  showUserQ();
}

function deleteMainQ(questionid){
  //console.log(questionid)
  const change = document.getElementById(questionid);
  let str="<div class='delete-question'><p><i class='trash fas fa-trash-alt'></p></i><p class='your-a-deleted'>This question is deleted</p></div>";
  change.innerHTML=str;
  const xhf = new XMLHttpRequest();
  xhf.open('POST','/deleteQuestion',true);
  xhf.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhf.send(JSON.stringify({id:questionid}));
}

// should be included in answer.ejs dropdownMenuButton
