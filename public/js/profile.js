const userid = document.getElementById('profile').querySelector('.profile-stats').querySelector('.friend').value;
const loggeduserid = document.getElementById('profile').querySelector('.profile-stats').querySelector('.user').value;
const numBar =  document.getElementById('profile').querySelector('.profile-stats');

//console.log(userid);

var xhguq = new XMLHttpRequest();
xhguq.open('GET','/UserQuestions/'+userid);
xhguq.onload = function(){
  var questions = JSON.parse(xhguq.response);
  numBar.querySelector('.questions').innerHTML = '<p onclick="showUserQ()">'+questions.length + " Questions</p>";
}
xhguq.send();

var xhgua = new XMLHttpRequest();
xhgua.open('GET','/UserAnswers/'+userid);
xhgua.onload = function(){
  var answers = JSON.parse(xhgua.response);
  numBar.querySelector('.answers').innerHTML = '<p onclick="showUserAns()">'+answers.length + " Answers</p>";
}
xhgua.send();

var xhguf = new XMLHttpRequest();
xhguf.open('GET','/getFriendsOfUser/'+userid);
xhguf.onload = function(){
 var friends = JSON.parse(xhguf.response);
 numBar.querySelector('.friends').innerHTML = '<p onclick="showUserFriends()">'+friends.length + " Friends</p>";
}
xhguf.send();
//console.log
