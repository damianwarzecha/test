export default class Id {
    private id = 1;

    increment() {
        this.id += 1;
    }

    get() {
        return this.id;
    }
}