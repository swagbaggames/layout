export class Debouncer {
    private readonly fnc: () => void
    private readonly duration: number
    private timeout?: number
    constructor(fnc: () => void, duration = 500) {
        this.fnc = fnc
        this.duration = duration
    }

    public trigger() {
        clearTimeout(this.timeout)
        this.timeout = setTimeout(this.fnc, this.duration)
    }
}
