/* eslint-disable react/forbid-prop-types */
import React from "react";
import PropTypes from "prop-types";

export default class DropdownItem extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    onItemSelect: PropTypes.func,
    children: PropTypes.any
  };

  static defaultProps = {
    className: "dropdown-items",
    disabled: false,
    onItemSelect: () => null,
    children: null
  };

  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect() {
    // 处理传递给回调函数的参数，目前只返回外部传递进来的 props。
    const { onItemSelect, disabled } = this.props;
    // if dropItem is disabled, do nothing.
    if (!disabled) {
      const filterProps = {};
      // 处理传递给回调函数的参数：去掉 typeof 为 function
      Object.keys(this.props).forEach(item => {
        if (typeof this.props[item] !== "function") {
          filterProps[item] = this.props[item];
        }
      });
      onItemSelect(filterProps);
    }
  }

  render() {
    const { disabled, className } = this.props;
    const classNameStr = `${disabled ? "disabled" : ""} ${className}`;
    return (
      <div className={classNameStr} onClick={this.handleSelect}>
        {this.props.children}
      </div>
    );
  }
}
