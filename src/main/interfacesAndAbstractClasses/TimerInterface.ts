interface TimerInterface {

    timerElement:HTMLElement,
    currentTime:number,
    worker:Worker,

    startTimer:(t:number)=>void,

    stopTimer:()=>void,

    setTime:(timer:HTMLElement, time:number)=>void,
    
    convertTimeToString:(time:number)=>string
}



interface TimerConstructorInterface {
    new ():TimerInterface
}

export {TimerInterface, TimerConstructorInterface};