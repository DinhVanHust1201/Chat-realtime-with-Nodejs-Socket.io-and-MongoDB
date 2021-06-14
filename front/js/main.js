socket = io ();
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix:true
});

let fromUser="Văn";
let toUser="Mr.Đức";
//socket.emit('userDetails',{fromUser,toUser});

function storeDetails() {
    fromUser = document.getElementById('from').value;
    toUser = document.getElementById('to').value;
    element = document.querySelectorAll(".chat-messages");
    socket.emit('userDetails',{fromUser,toUser}); //gửi thông tin đến client về cuộc trò chuyện đã thiết lập
}

//Gửi tin nhắn
chatForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    const msg = e.target.elements.msg.value;
    final = {
        'fromUser':fromUser,
        'toUser':toUser,
        'msg':msg
    };
    socket.emit('chatMessage',final); //gửi thông tin đoạn chat cung thông tin người gửi và người nhận tới server
    document.getElementById('msg').value=" ";
});

socket.on('output',(data) =>{
    console.log(data);
});

socket.on('output',(data) => { //nhận lịch sử chat khi 2 người đăng nhập và hiện thị
    for(var i=0; i<data.length;i++) {
        outputMessage(data[i]);
    }
    chatMessages.scrollTop=chatMessages.scrollHeight;
});

socket.on('message',(data) => { //nhận tin nhắn và hiện thị
        outputMessage(data);
        console.log(data);
    chatMessages.scrollTop=chatMessages.scrollHeight;
});

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`<p class="meta">${message.from}<span> ${message.time}, ${message.date}</span></p>
    <p class ="text">
        ${message.message}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}
