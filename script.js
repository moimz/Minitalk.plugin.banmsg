/**
 * 이 파일은 미니톡 스팸방지 플러그인의 일부입니다. (https://www.minitalk.io)
 *
 * 특정유저의 대화를 일시 차단합니다.
 * 
 * @file /plugins/banmsg/script.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 1.0.0
 * @modified 2021. 3. 12.
 */
if (Minitalk === undefined) return;

/**
 * 대화일시차단을 할 수 있는 최소권한
 * 0 ~ 9 : 0 : 손님, 9 : 관리자
 */
me.limit = 9;

/**
 * 대화일시차단 시간 (초)
 */
me.time = 60;

/**
 * 미니톡이 초기화되었을 때
 */
Minitalk.on("init",function(minitalk) {
	/**
	 * 특정유저의 대화가 일시차단되었다는 프로토콜을 정의한다.
	 */
	minitalk.socket.setProtocol("banmsg",function(minitalk,nickname,to,from) {
		// 대화가 일시차단되었다는 메시지를 채팅창에 뿌린다.
		minitalk.ui.printSystemMessage("info",from.nickname+"님이 " + nickname + "님의 대화를 " + me.time + "초 동안 일시차단하였습니다.");
		
		// 차단된 대상이 나인 경우 차단시간을 저장한다.
		if (minitalk.user.me.nickname == nickname) {
			minitalk.storage("banmsg",moment().unix() + me.time);
		}
	});
	
	/**
	 * 메시지를 전송하기전에 차단시간이 아직 남아있는지 확인하여, 차단시간이 남아있다면 메시지 전송을 막는다.
	 */
	minitalk.on("beforeSendMessage",function(minitalk) {
		if (minitalk.storage("banmsg") != null && minitalk.storage("banmsg") > moment().unix()) {
			minitalk.ui.printSystemMessage("error","대화일시차단중이므로 메시지를 전송할 수 없습니다. (남은시간 : " + (minitalk.storage("banmsg") - moment().unix()) + "초)");
			return false;
		}
	});
	
	/**
	 * 유저 메뉴 젤 마지막에 대화일시차단 메뉴를 추가한다.
	 */
	minitalk.user.appendMenu({
		text:"대화일시차단",
		iconClass:"mi mi-denied",
		visible:function(minitalk,user) {
			// 나의 레벨이 대화일시차단을 할 수 없는 레벨인 경우 메뉴를 숨긴다.
			if (minitalk.user.me.level < me.limit) return false;
			
			// 메뉴를 보이는 대상 (user) 가 나인 경우에는 해당 메뉴를 보이지 않는다.
			if (user.nickname == minitalk.user.me.nickname) return false;
			
			// 나머지 경우에 해당 메뉴를 보인다.
			return true;
		},
		handler:function(minitalk,user) {
			// 메뉴를 클릭했을 때 전체 유저에게 특정유저의 대화가 일시차단되었다는 프로토콜을 전송한다.
			minitalk.socket.sendProtocol("banmsg",user.nickname);
			minitalk.ui.printSystemMessage("info",user.nickname+"님의 대화를 " + me.time + "초 동안 일시차단하였습니다.");
		}
	});
});