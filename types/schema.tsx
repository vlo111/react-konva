export  interface IEditable {
    setEditable(name: string): void,
    editableText: string,
}

export interface IPosition {
    x: number,
    y: number,
    height: number,
    width: number,
}

export interface ICustomText {
    name: string,
    lineHeight: number,
}