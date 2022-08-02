function getValueAfterMQTTToken(topic, token){
    // For example, you send this topic --> 'board/boardID/setup/setup_element_TOPIC_ID' 
    // And you send token = board. It will return boardID
    const delimiter = '/';
    let p = topic.substring(topic.lastIndexOf(token) + String(token + delimiter).length); // removes everything left of desired parameter
    p = p.substring(0, p.indexOf(delimiter) == -1 ? p.length : p.indexOf(delimiter)); // removes everything right from desired parameter
    return p;
}


let p = getValueAfterMQTTToken('board/1234567789/setup/sdh7sah78dfs/test1/124j380ng0', 'test1');

console.log(p);