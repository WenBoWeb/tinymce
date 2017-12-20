import { Option } from '@ephox/katamari';
import Css from './Css';
import Style from '../../impl/Style';

var isCentered = function (element) {
  var dom = element.dom();
  if (Style.isSupported(dom)) {
    var marginLeft = dom.style.marginRight;
    var marginRight = dom.style.marginLeft;
    return marginLeft === 'auto' && marginRight === 'auto';
  } else {
    return false;
  }
};

var divine = function (element) {
  if (isCentered(element)) return Option.some('center');
  else {
    var val = Css.getRaw(element, 'float').getOrThunk(function () {
      return Css.get(element, 'float');
    });
    return val !== undefined && val !== null && val.length > 0 ? Option.some(val) : Option.none();
  }
};

var getRaw = function (element) {
  return Css.getRaw(element, 'float').getOr(null);
};

var setCentered = function (element) {
  Css.setAll(element, {
    'margin-left': 'auto',
    'margin-right': 'auto'
  });
};

export default <any> {
  isCentered: isCentered,
  divine: divine,
  getRaw: getRaw,
  setCentered: setCentered
};