import WorkerClassInterface from "./WorkerInterface";

//const scope=self //as any//unknown as DedicatedWorkerGlobalScope;
//const ctx: Worker = self as any;

class TimerWorker implements WorkerClassInterface  {

    end:boolean=false;

    constructor(){
        self.addEventListener('message', (e:MessageEvent)=>{
            if(e.data.action==="start") {
                this.countTime(e.data.time===null ? 0 : e.data.time);
                } else if (e.data.action==="stop") this.end=true;
        });
    }

    countTime(time:number){
        if(this.end===true) {
            self.postMessage({ action: "stop", time});//we can't use scope.postMessage({ action: "stop", time}, "*")
            return;
        }
        self.postMessage({ action: "move", time});
        setTimeout(() => { this.countTime(++time) }, 1000)
    }
}

const timerWorker=new TimerWorker();