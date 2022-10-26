import { Text } from "two.js/src/text";

// Local Imports
import { Canvas } from "./canvas";
import { MousePos } from "../mousepos";
import { Bbox, bbox } from "./bbox";
import { labelStyle } from "./style";
import { EntityInterface, EntityKind } from "./entity";
import { Point } from "../point";

export enum LabelKind {
  Name = "Name",
  Of = "Of",
}

// Interface to "Label Parents",
// consisting of the notification methods the Label will call on changes.
export interface LabelParent {
  updateLabelText(label: Label): void;
  addLabelDrawing(textElem: Text): void;
}

export interface LabelData {
  text: string;
  loc: Point;
  kind: LabelKind;
  parent: LabelParent;
}

// # Text Label
//
export class Label implements EntityInterface {
  constructor(public data: LabelData, public drawing: Text) {}
  entityKind: EntityKind.Label = EntityKind.Label;
  entityId: number | null = null;
  bbox: Bbox = bbox.empty();
  highlighted: boolean = false;

  // Create and return a new `Label`
  static create(data: LabelData): Label {
    const drawing = Label.createDrawing(data);
    const label = new Label(data, drawing);
    return label;
  }
  // Create the drawn element from label data
  static createDrawing(data: LabelData): Text {
    const textElem = new Text(data.text);
    textElem.translation.set(data.loc.x, data.loc.y);
    return labelStyle(textElem);
  }
  draw() {
    // Remove any existing drawing and replace it with a new one
    // Note notification to our parent occurs in `create`.
    this.drawing.remove();
    this.drawing = Label.createDrawing(this.data);
    // Add it to our parent
    // Note this must be done *before* we compute the bounding box.
    this.data.parent.addLabelDrawing(this.drawing);
    this.updateBbox();
  }
  // Update our text value
  update(text: string) {
    this.data.text = text;
    this.drawing.value = text;
    this.updateBbox();
    this.data.parent.updateLabelText(this);
  }
  updateBbox() {
    this.bbox = bbox.get(this.drawing);
  }
  // Boolean indication of whether `mousePos` is inside the instance.
  // The confusing part: despite calling "getBoundingClientRect", this uses the *canvas* coordinates(?).
  hitTest = (mousePos: MousePos) => bbox.hitTest(this.bbox, mousePos.canvas);
  // Update styling to indicate highlighted-ness
  highlight() {
    labelStyle(this.drawing, true);
    this.highlighted = true;
  }
  // Update styling to indicate the lack of highlighted-ness
  unhighlight() {
    labelStyle(this.drawing, false);
    this.highlighted = false;
  }
  // Abort an in-progress instance.
  abort() {}
  get kind(): LabelKind {
    return this.data.kind;
  }
  get text(): string {
    return this.data.text;
  }
}
