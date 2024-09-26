import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./App.css";

function App() {
  const [nickname, setNickname] = useState("");
  const [accumulatedTime, setAccumulatedTime] = useState("0시간 0분 0초");
  const [accumulatedHours, setAccumulatedHours] = useState(0);
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 토글
  const [hours, setHours] = useState(""); // 시 입력
  const [minutes, setMinutes] = useState(""); // 분 입력
  const [seconds, setSeconds] = useState(""); // 초 입력
  const maxHours = 80; // 최대 80시간

  // 수정 버튼 클릭 시 입력창 토글
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // 출근 버튼 클릭 시 서버로 전송
  const handleClockIn = async () => {
    try {
      const response = await fetch("http://34.64.189.149:8080/in", {
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
      const response = await fetch("http://34.64.189.149:8080/out", {
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
      const response = await fetch("http://34.64.189.149:8080/sum", {
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

  // 인트라 시간 확인 버튼 클릭 시 서버로 요청 (Alert로 출력)
  const handleIntraTime = async () => {
    try {
      const response = await fetch("http://34.64.189.149:8080/intra", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id=${nickname}`, // FormData 형식으로 id 전송
      });

      if (response.ok) {
        const data = await response.json();
        console.log("인트라 시간 데이터:", data);

        // 받은 데이터를 alert로 표시
        if (data && data.time) {
          const { hours, minutes, seconds } = data.time;
          alert(`인트라 시간: ${hours}시간 ${minutes}분 ${seconds}초`);
        } else {
          alert("인트라 시간 데이터를 불러오지 못했습니다.");
        }
      } else {
        console.log("인트라 시간 가져오기 실패");
      }
    } catch (error) {
      console.error("인트라 시간 요청 중 오류 발생:", error);
    }
  };

  // 누적시간 수정 서버 전송
  const handleTimeUpdate = async () => {
    const timeString = `${hours}:${minutes}:${seconds}`;
    try {
      const response = await fetch("http://34.64.189.149:8080/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id=${nickname}&time=${timeString}`, // FormData 형식으로 전송
      });

      if (response.ok) {
        console.log("누적 시간 수정 완료:", timeString);
        setAccumulatedTime(formatAccumulatedTime(timeString)); // 화면에 반영
        setIsEditing(false); // 수정창 닫기
      } else {
        console.log("누적 시간 수정 실패");
      }
    } catch (error) {
      console.error("누적 시간 수정 요청 중 오류 발생:", error);
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

  // 누적 시간의 퍼센테이지 계산
  const percentage = (accumulatedHours / maxHours) * 100;

  return (
    <div className="container">
      <h1>42 time</h1>

      {/* 닉네임 입력 필드 */}
      <input
        type="text"
        placeholder="닉네임을 입력하세요"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="input"
      />

      <button onClick={handleClockIn} className="button">
        출근
      </button>
      <button onClick={handleClockOut} className="button button-danger">
        퇴근
      </button>

      {/* 수정 버튼 */}
      <button onClick={toggleEdit} className="button button-update">
        누적시간 수정
      </button>

      {/* 수정 모드일 때 입력창 표시 */}
      {isEditing && (
        <div className="edit-container">
          <input
            type="number"
            placeholder="시"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="input-time"
          />
          <input
            type="number"
            placeholder="분"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="input-time"
          />
          <input
            type="number"
            placeholder="초"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            className="input-time"
          />
          <button onClick={handleTimeUpdate} className="button button-update">
            수정 완료
          </button>
        </div>
      )}

      <div className="progress-container">
        <div className="progress-bar">
          <CircularProgressbar
            value={percentage} // 퍼센테이지로 표시
            text={`${percentage.toFixed(2)}%`} // 퍼센테이지 텍스트 표시
            styles={buildStyles({
              pathColor: `rgba(62, 152, 199, ${percentage / 100})`,
              textColor: "#f88",
              trailColor: "#d6d6d6",
            })}
          />
        </div>
      </div>

      <button onClick={handleTotalTime} className="button button-total">
        누적시간
      </button>

      {/* 인트라 시간 확인 버튼 */}
      <button onClick={handleIntraTime} className="button button-intra">
        인트라 시간 확인
      </button>

      <p>{accumulatedTime}</p>
    </div>
  );
}

export default App;
