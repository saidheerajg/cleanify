var React = require('react');

var WatchStock = React.createClass({
    getInitialState: function() {
        return {email: ""};
    },
    sendEmail: function() {
        var xhr = new XMLHttpRequest();
        xhr.open('get', 'https://mailtrap.io/api/v1/user', true);
        xhr.onload = () => {
        var data = JSON.parse(xhr.responseText);
        this.setState({ email: data });
        };
        xhr.send();
    },
    render: function () {
        return (
            <div className="row">
                <p>Please enter your email to subscribe</p>
                <div className="input-group">
                    <input type="text" className="form-control" placeholder="email..." value={this.state.email} />
                    <span className="input-group-btn">
                        <button className="btn btn-default" type="button" onClick={this.sendEmail}>
                            <span className="glyphicon glyphicon-eye-open" aria-hidden="true"></span> Subscribe
                        </button>
                    </span>
                </div>
            </div>
        );
    }
});

var StockRow = React.createClass({
    unwatch: function() {
        this.props.unwatchStockHandler(this.props.stock.symbol);
    },
    render: function () {
        var lastClass = '',
            changeClass = 'change-positive',
            iconClass = 'glyphicon glyphicon-triangle-top';
        if (this.props.stock === this.props.last) {
            lastClass = this.props.stock.change < 0 ? 'last-negative' : 'last-positive';
        }
        if (this.props.stock.change < 0) {
            changeClass = 'change-negative';
            iconClass = 'glyphicon glyphicon-triangle-bottom';
        }
        return (
            <tr>
                <td>{this.props.stock.symbol}</td>
                <td>{this.props.stock.open}</td>
                <td className={lastClass}>{this.props.stock.last}</td>
                <td className={changeClass}>{this.props.stock.change} <span className={iconClass} aria-hidden="true"></span></td>
                <td>{this.props.stock.high}</td>
                <td>{this.props.stock.low}</td>
                <td><button type="button" className="btn btn-default btn-sm" onClick={this.unwatch}>
                    <span className="glyphicon glyphicon-eye-close" aria-hidden="true"></span>
                </button></td>
            </tr>
        );
    }
});

var StockTable = React.createClass({
    render: function () {
        var items = [];
        for (var symbol in this.props.stocks) {
            var stock = this.props.stocks[symbol];
            items.push(<StockRow key={stock.symbol} stock={stock} last={this.props.last} unwatchStockHandler={this.props.unwatchStockHandler}/>);
        }
        return (
            <div className="row">
            <table className="table-hover">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Open</th>
                        <th>Last</th>
                        <th>Change</th>
                        <th>High</th>
                        <th>Low</th>
                        <th>Unwatch</th>
                    </tr>
                </thead>
                <tbody>
                    {items}
                </tbody>
            </table>
            </div>
        );
    }
});
var feed = (function () {

    var watchList = [];

    var stocks = [
        {symbol: "GM", open: 38.87},
        {symbol: "GE", open: 25.40},
        {symbol: "MCD", open: 97.05},
        {symbol: "UAL", open: 69.45},
        {symbol: "WMT", open: 83.24},
        {symbol: "AAL", open: 55.76},
        {symbol: "LLY", open: 76.12},
        {symbol: "JPM", open: 61.75},
        {symbol: "BAC", open: 15.84},
        {symbol: "BA", open: 154.50}
    ];

    stocks.forEach(function(stock) {
        stock.last = stock.open;
        stock.high = stock.open;
        stock.low = stock.open;
    });

    return {
        onChange: function(callback) {
            setInterval(function() {
                var index = Math.floor(Math.random() * stocks.length),
                    stock = stocks[index],
                    maxChange = stock.open * 0.005,
                    change = maxChange - Math.random() * maxChange * 2,
                    last;

                change = Math.round(change * 100) / 100;
                change = change === 0 ? 0.01 : change;

                last = stock.last + change;

                if (last > stock.open * 1.15 || last < stock.open * 0.85)
                {
                    change = -change;
                    last = stock.last + change;
                }

                stock.change = change;
                stock.last = Math.round(last * 100) / 100;
                if (stock.last > stock.high) {
                    stock.high = stock.last;
                }
                if (stock.last < stock.low) {
                    stock.low = stock.last;
                }
                if (watchList.indexOf(stock.symbol) > -1) {
                    callback(stock);
                }
            }, 200);
        },
        watch: function(symbols) {
            console.log(symbols);
            symbols.forEach(function(symbol) {
                if (watchList.indexOf(symbol) < 0) {
                    watchList.push(symbol);
                }
            });
        },
        unwatch: function(symbol) {
            var index = watchList.indexOf(symbol);
            if (index > -1) {
                watchList.splice(index, 1);
            }
        }
    };

}());


module.exports = React.createClass({
  displayName: 'Stocks',
  
    getInitialState: function() {
        var stocks = {};
        feed.watch(['MCD', 'BA', 'BAC', 'LLY', 'GM', 'GE', 'UAL', 'WMT', 'AAL', 'JPM']);
        feed.onChange(function(stock) {
            stocks[stock.symbol] = stock;
            this.setState({stocks: stocks, last: stock});
        }.bind(this));
        return {stocks: stocks};
    },
    watchStock: function(symbols) {
        symbols = symbols.replace(/ /g,'');
        var arr = symbols.split(",");
        feed.watch(arr);
    },
    unwatchStock: function(symbol) {
        feed.unwatch(symbol);
        var stocks = this.state.stocks;
        delete stocks[symbol];
        this.setState({stocks: stocks});
    },
    render: function () {
        return (
            <div>
                <WatchStock watchStockHandler={this.watchStock}/>
                <StockTable stocks={this.state.stocks} last={this.state.last} unwatchStockHandler={this.unwatchStock}/>
                <div className="row">
                    <div className="alert alert-warning" role="alert">All stock values are fake and changes are simulated. Do not trade based on the above data.</div>
                </div>
            </div>
        );
    }
});

