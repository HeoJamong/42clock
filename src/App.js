import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./App.css";

function App() {
  const [nickname, setNickname] = useState("");
  const [accumulatedTime, setAccumulatedTime] = useState("0시간 0분 0초");
  const [accumulatedHours, setAccumulatedHours] = useState(0); // 누적 시간
  const maxHours = 80; // 최대 80시간

  // 출근 버튼 클릭 시 서버로 전송
  const handleClockIn = async () => {
    try {
      const response = await fetch("http://34.64.186.69:8080/in", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id=${nickname}`, // FormData 형식으로 id 전송
      });

      if (response.ok) {
        console.log(`${nickname}님 출근 완료`);
      } else {
        console.log("출근 시간 전송 실패");
      }
    } catch (error) {
      console.error("출근 요청 중 오류 발생:", error);
    }
  };

  // 퇴근 버튼 클릭 시 서버로 전송
  const handleClockOut = async () => {
    try {
      const response = await fetch("http://34.64.186.69:8080/out", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id=${nickname}`, // FormData 형식으로 id 전송
      });

      if (response.ok) {
        console.log(`${nickname}님 퇴근 완료`);
      } else {
        console.log("퇴근 시간 전송 실패");
      }
    } catch (error) {
      console.error("퇴근 요청 중 오류 발생:", error);
    }
  };

  // 누적 시간 버튼 클릭 시 서버로부터 데이터 가져오기
  const handleTotalTime = async () => {
    try {
      const response = await fetch("http://34.64.186.69:8080/sum", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id=${nickname}`, // FormData 형식으로 id 전송
      });

      if (response.ok) {
        const data = await response.json();
        console.log("누적 시간 데이터:", data);

        // 받은 시간을 누적 시간과 형식에 맞게 처리
        if (data && data.sumtime) {
          const timeString = data.sumtime;
          setAccumulatedTime(formatAccumulatedTime(timeString));
          setAccumulatedHours(convertToHours(timeString)); // 시간을 시간 단위로 변환
        } else {
          console.log("누적 시간 데이터가 잘못되었습니다.");
        }
      } else {
        console.log("누적 시간 가져오기 실패");
      }
    } catch (error) {
      console.error("누적 시간 요청 중 오류 발생:", error);
    }
  };

  // 인트라 시간 확인 버튼 클릭 시 서버로 요청
  const handleIntraTime = async () => {
    try {
      const response = await fetch("http://34.64.186.69:8080/intra", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id=${nickname}`, // FormData 형식으로 id 전송
      });

      if (response.ok) {
        const data = await response.json();
        console.log("인트라 시간 데이터:", data);
      } else {
        console.log("인트라 시간 가져오기 실패");
      }
    } catch (error) {
      console.error("인트라 시간 요청 중 오류 발생:", error);
    }
  };

  // 서버에서 받은 시간을 보기 좋은 형식으로 변환
  const formatAccumulatedTime = (timeString) => {
    const components = timeString.split(":");
    const hours = components[0] || "0";
    const minutes = components[1] || "0";
    const seconds = components[2] || "0";
    return `${hours}시간 ${minutes}분 ${seconds}초`;
  };

  // 누적 시간을 시간 단위로 변환
  const convertToHours = (timeString) => {
    const components = timeString
      .split(":")
      .map((part) => parseFloat(part) || 0);
    const hours = components[0];
    const minutesToHours = components[1] / 60;
    return hours + minutesToHours; // 소수점으로 시간 변환
  };

  return (
    <div className="App">
      <div className="container">
        <h1>42 Clock</h1>

        {/* 닉네임 입력 필드 */}
        <input
          type="text"
          placeholder="닉네임을 입력하세요"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="input"
        />

        <div className="button-group">
          <button onClick={handleClockIn} className="btn clock-in">
            출근
          </button>
          <button onClick={handleClockOut} className="btn clock-out">
            퇴근
          </button>
        </div>

        <div className="progress-container">
          <CircularProgressbar
            value={accumulatedHours}
            maxValue={maxHours}
            text={`${accumulatedHours.toFixed(2)}h`}
            styles={buildStyles({
              pathColor: `rgba(62, 152, 199, ${accumulatedHours / maxHours})`,
              textColor: "#f88",
              trailColor: "#d6d6d6",
              backgroundColor: "#3e98c7",
            })}
          />
        </div>

        <div className="button-group">
          <button onClick={handleTotalTime} className="btn total-time">
            누적시간
          </button>
          <button onClick={handleIntraTime} className="btn intra-time">
            인트라 시간 확인
          </button>
        </div>

        <p>{accumulatedTime}</p>
      </div>
    </div>
  );
}

export default App;
