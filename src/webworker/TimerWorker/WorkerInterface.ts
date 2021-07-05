interface WorkerClassInterface   {
    end:boolean,

    countTime:(startTime:number)=>void
}

/*abstract class WorkerAbstratClass extends Worker implements WorkerClassInterface  {

    end:boolean;

    constructor(stringUrl) {
        super(stringUrl);
        self.addEventListener('message', (e:MessageEvent)=>{
            if(e.data.action==="start") {
            
                this.countTime(e.data.time===null ? 0 : e.data.time);
                } else if (e.data.action==="") null;
        });
        
    }

    countTime(startTime:number){}
}*/

export default WorkerClassInterface;