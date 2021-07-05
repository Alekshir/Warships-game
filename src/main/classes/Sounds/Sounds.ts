class Sounds {

    private explosionSound:HTMLAudioElement;

    constructor() {
        const explosionSound=new Audio('./sounds/explosion.mp3');
        this.explosionSound=explosionSound;
    }

    getExplosionSound(){
        return this.explosionSound;
    }
}

const soundObject=new Sounds();

export default soundObject;