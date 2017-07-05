// class for creating the appropriate transform for an axis label.
// Takes the axis label text node, the axis node, and a props object.
// The props object should have keys:
//    axisType,
//    translateX,
//    translateY,
//    axisLength
// Optional keys:
//    axisLabelRotation (default 0),
//    axisLabelPosition (default "middle"),
//    axisLabelExtraPadding (default 20)
class AxisLabelHelper {
  constructor(textNode, axisNode, props) {
    // DOM nodes for the axis label and axis; access their heights and widths via node.getBBox.height/width methods
    this.textNode = textNode;
    this.axisNode = axisNode;
    this.props = props;

    // Translations applied to the axis and label
    this.axisTranslateX = props.translateX;
    this.axisTranslateY = props.translateY;

    this.axisLabelProps = props.axisLabelProps;

    // Additional translations applied to the label
    this.labelTranslateX = this.axisLabelProps.translateX || 0;
    this.labelTranslateY = this.axisLabelProps.translateY || 0;

    this.position = this.axisLabelProps.position || "middle";

    this.verticalMultiplier = {
      left: 1,
      bottom: -1,
      right: 1,
      top: -1
    }[props.axisType];
    this.horizontalMultiplier = this.verticalMultiplier === 1 ? 0 : 1;
  }

  // Helper function for #createTranslationObject method.
  heightTranslateHelper() {
    switch(this.position) {
      case "middle":
        return this.props.axisLength/2 + (this.verticalMultiplier * this.textNode.getBBox().width/2);
      case "beginning":
        return (Math.max(0, this.verticalMultiplier) * this.props.axisLength) + (Math.min(0, this.horizontalMultiplier) * this.textNode.getBBox().width);
      case "end":
        return (this.horizontalMultiplier * this.props.axisLength) + (this.verticalMultiplier * this.textNode.getBBox().width);
      default:
        throw `Error Axis#heightTranslateHelper: no case for position: '${this.position}'`
    }
  }

  // Returns the translateX and translateY numbers required for properly aligning the
  // axis label based on the axisType and position props.
  createTranslationObject() {
    switch(this.props.axisType) {
      case "left":
        return {
          translateX: this.axisTranslateX - this.axisNode.getBBox().width + this.labelTranslateX,
          translateY: this.axisTranslateY + this.heightTranslateHelper(this.position) + this.labelTranslateY
        };
      case "bottom":
        return {
          translateX: this.axisTranslateX + this.heightTranslateHelper(this.position) + this.labelTranslateX,
          translateY: this.axisTranslateY + this.axisNode.getBBox().height + this.labelTranslateY,
        };
      default:
        throw `Error in Axis#positionHelper: no case for axisType: ${this.props.axisType}`;
    }
  }

  // Creates a transformObject comprised of a translation and rotation.
  createAxisLabelTransformObject() {
    const translationObject = this.createTranslationObject();
    const transformObject = {
      translateX: translationObject.translateX,
      translateY: translationObject.translateY,
      rotation: this.axisLabelProps.rotation || 0
    };
    return transformObject;
  }

  // Takes an object with translateX, translateY, and rotation keys.
  // Returns a translate(x, y) rotate(deg) string that can be passed as a transform.
  formatTransform({translateX, translateY, rotation}) {
    return `translate(${translateX}, ${translateY}) rotate(${rotation})`;
  }

  // Creates a transform object.
  createAxisLabelTransform() {
    if (!this.textNode || !this.axisNode) {
      return `translate(0, 0)`;
    }

    const transformObject = this.createAxisLabelTransformObject();
    return this.formatTransform(transformObject);
  }
}

// Takes the axis label text node, the axis node, and a props object.
// The props object should have keys:
//    axisType,
//    translateX,
//    translateY,
//    axisLength
// Optional keys:
//    axisLabelRotation (default 0),
//    axisLabelPosition (default "middle"),
//    axisLabelExtraPadding (default 20)
// Returns a translate(x, y) rotate(r) string that can be passed as a transform.
export const createAxisLabelTransform = (textNode, axisNode, props) => {
  const axisLabelHelper = new AxisLabelHelper(textNode, axisNode, props);
  return axisLabelHelper.createAxisLabelTransform();
}
