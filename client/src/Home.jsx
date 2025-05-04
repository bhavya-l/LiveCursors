import useWebSocket from "react-use-websocket";
import throttle from "lodash.throttle";
import { useEffect, useRef } from "react";
import { Cursor } from "./components/Cursor";

const renderCursors = (users) => {
  return Object.keys(users).map((userId) => {
    const user = users[userId];
    return <Cursor key={userId} point={[user.state.x, user.state.y]}></Cursor>;
  });
};
// lodash.throttle can let you define an interval and basically says you only call the function
// for the set interval time
const renderUserLists = (users) => {
  return (
    <ul>
      {Object.keys(users).map((userId) => {
        return <li key={userId}>{JSON.stringify(users[userId])}</li>;
      })}
    </ul>
  );
};

export function Home({ username }) {
  const WS_URL = "ws://127.0.0.1:8000";
  const socket = useWebSocket(WS_URL, {
    queryParams: { username },
  });

  const THROTTLE = 50;
  const sendJsonMessageThrottled = useRef(
    throttle(socket.sendJsonMessage, THROTTLE)
  );

  useEffect(() => {
    socket.sendJsonMessage({
      x: 0,
      y: 0,
    });
    window.addEventListener("mousemove", (e) => {
      sendJsonMessageThrottled.current({
        x: e.clientX,
        y: e.clientY,
      });
    });
  }, []);

  if (socket.lastJsonMessage) {
    return (
      <>
        {renderUserLists(socket.lastJsonMessage)}
        {renderCursors(socket.lastJsonMessage)}
      </>
    );
  }

  return <h1>Hello {username}</h1>;
}
