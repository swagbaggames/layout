import { Signal } from "typed-signals"
import type { VoidSignal } from "../types/VoidSignal"
import { Debouncer } from "../debouncer"
import type { OrientationKey, OrientationMap } from "../types/Orientation"

export class ARLayout {
    public readonly onResize: VoidSignal = new Signal()
    public readonly onReorient: VoidSignal = new Signal()
    private readonly debouncer
    private readonly properties: LayoutProperties
    private cachedOrientation: OrientationKey = this.orientation

    private _scale: number = 0

    public get scale() {
        return this._scale
    }

    public get orientation(): OrientationKey {
        return window.innerHeight > window.innerWidth ? "portrait" : "landscape"
    }

    public get width() {
        return this.properties.width
    }

    public get height() {
        return this.properties.height
    }

    public get padding() {
        return this.properties.padding
    }

    public get position() {
        return this.computePosition()
    }

    public get current(): DerivedProperties {
        const paddingProperties = this.properties.padding[this.orientation]
        const { left, right, top, bottom } = paddingProperties
        const padding: DerivedPadding = {
            horizontal: left + right,
            vertical: top + bottom,
            ...paddingProperties,
        }
        return { padding }
    }

    // public get computed(): ComputedProperties {
    //     const { padding } = this.current
    //     const { left, right, top, bottom } = padding

    //     return {
    //         padding: {
    //             // TODO return scaled version of padding
    //             ...padding,
    //         },
    //     }

    // TODO
    // left
    // right
    // top
    // bottom
    // center
    // screen centre
    // }

    constructor(options: ARLayoutOptions) {
        this.debouncer = new Debouncer(this.resize.bind(this), options.debounce)
        this.properties = options.layout
        window.addEventListener("resize", this.debouncer.trigger.bind(this.debouncer))
    }

    public resize() {
        const newOrientation = this.orientation
        this.cachedOrientation = newOrientation

        const totalWidth = this.current.padding.horizontal + this.width
        const totalHeight = this.current.padding.vertical + this.height

        const widthRatio = window.innerWidth / totalWidth
        const heightRatio = window.innerHeight / totalHeight

        this._scale = Math.min(widthRatio, heightRatio)

        if (newOrientation !== this.cachedOrientation) {
            this.onResize.emit()
        }
        this.onResize.emit()
    }

    private computePosition(): Point {
        const width = window.innerWidth
        const height = window.innerHeight
        // TODO believe we can use these to present additional useful position
        const xDiff = (width - this.width * this._scale) / 2
        const yDiff = (height - this.height * this._scale) / 2

        const { left, right, top, bottom } = this.current.padding
        const xPad = (left - right) * this.scale
        const yPad = (top - bottom) * this.scale

        return {
            x: xDiff + xPad / 2,
            y: yDiff + yPad / 2,
        }
    }
}

export interface DerivedProperties {
    padding: DerivedPadding
}

export interface DerivedPadding extends Padding {
    vertical: number
    horizontal: number
}

export interface ARLayoutOptions {
    debounce: number
    layout: LayoutProperties
}

export interface LayoutProperties {
    width: number
    height: number
    padding: OrientationMap<Padding>
}

export interface Padding {
    top: number
    left: number
    right: number
    bottom: number
}

export interface Point {
    x: number
    y: number
}
