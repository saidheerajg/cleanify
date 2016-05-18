var React = require('react');

var Header = require('./Components/Header');
var Stocks = require('./Components/Stocks');
var Favicon = require('react-favicon');

var faviconUrl = require('./Assets/favicon.ico');

module.exports = React.createClass({
  displayName: 'App',

  render: function () {
    return (<div>
              <Header/>
              <Stocks />
              <Favicon url={ faviconUrl }/>
            </div>)
  }

});