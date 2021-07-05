import { TimerInterface, TimerConstructorInterface } from "../../interfacesAndAbstractClasses/TimerInterface";

class GameTimer implements TimerInterface {

    timerElement: HTMLElement;
    currentTime: number = 0;
    worker: Worker;

    constructor() {
        this.timerElement = document.getElementsByClassName("timer")[0] as HTMLElement;
        this.worker = new Worker("./worker.js");
        this.worker.addEventListener('message', (e) => {
            if (e.data.action === "move" || e.data.action === "stop") {
                this.timerElement.innerText = this.convertTimeToString(e.data.time);
                this.currentTime=e.data.time;
            } else this.timerElement.innerText = '00:00:00';
        });
    }

    startTimer(t:number) {
        this.worker.postMessage({ action: "start", time: t });
    }

    stopTimer() {
        this.worker.postMessage({ action: "stop" });
    }

    setTime(timer: HTMLElement, time: number) {}

    convertTimeToString(t: number): string {
        let hours: number | string = Math.trunc(t / (60 * 60));
        hours = hours < 10 ? `0${hours}` : hours;
        let minutes: number | string = Math.trunc((t % (60 * 60) / 60));
        minutes = minutes < 10 ? `0${minutes}` : minutes;
        let seconds: number | string = t % 60;
        seconds = seconds < 10 ? `0${seconds}` : seconds;
        return `${hours} : ${minutes} : ${seconds}`;
    }
}

const Timer: TimerConstructorInterface = GameTimer;

export default Timer;