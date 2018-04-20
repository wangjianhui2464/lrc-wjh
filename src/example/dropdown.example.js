import React from 'react';
import Dropdown from '../Dropdown';
import './dropdown.example.css';

const onCommand = function (clickItemProps) {
  alert(` 指令可以做不同的事情, ${JSON.stringify(clickItemProps)}`);
};

export default class DropdownExample extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      buttonText: '点我改变Text',
    };
  }

  render() {
    return (
      <div className="rootDiv rootDiv2">
        <div>
          <h4>1、基础下拉菜单示例：</h4>

          <Dropdown trigger="click" buttonText="京东JD">
            <Dropdown.Item>京东超市</Dropdown.Item>
            <Dropdown.Item>7-FRESH</Dropdown.Item>
            <Dropdown.Item>京东物流</Dropdown.Item>
          </Dropdown>
        </div>

        <div>
          <h4>2、指定触发事件：hover | click</h4>

          <Dropdown trigger="hover" buttonText="上来就触发">
            <Dropdown.Item>Hover</Dropdown.Item>
            <Dropdown.Item>Click</Dropdown.Item>
            <Dropdown.Item>^_^</Dropdown.Item>
          </Dropdown>
        </div>

        <div>
          <h4>3、指定选中之后回调事件 onItemSelect： item 可设置禁止点击</h4>

          <Dropdown
            trigger="click"
            buttonText="点击触发回调"
            onItemSelect={(clickItem) => {
              onCommand(clickItem);
            }}
          >
            <Dropdown.Item key="skuId" disabled={false}>
              这个可以点
            </Dropdown.Item>
            <Dropdown.Item disabled>来点我呀</Dropdown.Item>
            <Dropdown.Item skuId="1234" disabled={false}>
              这个也可以点
            </Dropdown.Item>
          </Dropdown>
        </div>

        <div>
          <h4>4、自定义样式：className</h4>

          <Dropdown
            trigger="hover"
            className="dropdown-new"
            buttonText={this.state.buttonText}
            onItemSelect={(clickItem) => {
              let temp = '';
              if (clickItem.keyCmd === '234') {
                temp = '你点了第一个';
              } else if (clickItem.keyCmd === '345') {
                temp = '第二个';
              } else {
                temp = '别点了😯';
              }
              this.setState({
                buttonText: temp,
              });
            }}
          >
            <Dropdown.Item key="234" disabled={false}>
              按钮变了
            </Dropdown.Item>
            <Dropdown.Item key="345" disabled={false}>
              <div>
                <span>列表变了</span>
              </div>
            </Dropdown.Item>
            <Dropdown.Item key="657" disabled={false}>
              <span
                onClick={() => {
                  console.log('我是下拉列表的是事件。');
                }}
              >
                这项有事件
              </span>
            </Dropdown.Item>
          </Dropdown>
        </div>
      </div>
    );
  }
}

