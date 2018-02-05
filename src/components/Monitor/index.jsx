import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react'
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import { get } from '../../api'

const API_HOSTNAME = 'http://localhost:3000/api/v0'
const CLIENT_ID = 'some-user'

const styles = theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'flex-end'
  },
  button: {
    maxWidth: '30%',
    margin: theme.spacing.unit,
    alignSelf: 'flex-end'
  }
});

class Monitor extends Component {
  constructor(props) {
    super(props)
    this.state = this.getInitialState()
  }

  getInitialState = () => ({ option: this.getOption(), data: null })

  componentDidMount() {
    this.fetchNewData()
  }

  getOption = () => ({
    title: {
      text: 'API Monitoring by Prometheus',
    },
    tooltip: {
      trigger: 'axis',
      borderRadius: 0
    },
    legend: {
      data: ['Calls']
    },
    toolbox: {
      show: true,
      orient: 'horizontal',
      right: 30,
      feature: {
        dataView: {
          readOnly: true,
          title: 'data view',
          lang: ['Data View', 'cancel', 'refresh']
        },
        restore: {
          title: 'restore'
        },
        saveAsImage: {
          title: 'save as image'
        }
      }
    },
    grid: {
      top: 60,
      left: 30,
      right: 60,
      // bottom: 0
    },
    dataZoom: [
      {
        type: 'slider',
        start: 0,
        end: 100
      },
      {
        type: 'inside',
        start: 0,
        end: 100
      }
    ],
    xAxis: [
      {
        type: 'time',
        boundaryGap: true
      }
    ],
    yAxis: [
      {
        type: 'value',
        scale: true,
        name: 'Requests/s',
        min: 0,
        boundaryGap: [0.1, 0.1]
      }
    ],
    series: []
  })

  fetchNewData = async () => {
    const { option } = this.state

    let d
    try {
      d = await get(`${API_HOSTNAME}/metrics/${CLIENT_ID}/requests`)
    } catch (err) {
      console.log(err)
      return
    }

    if (!d) return

    option.title.text = `API Requests per Second`

    d.data.forEach((item, index) => {
      option.series.push({
        name: item.metric.path,
        type: 'line',
        smooth: true,
        data: item.values
      })
    })

    this.setState({ option, data: d.results })
  }

  render = () => {
    const { classes } = this.props

    return (
      <div className={classes.container}>
        <Button
          variant="raised"
          color="primary"
          className={classes.button}
          onClick={this.fetchNewData}
        >
          Refresh Data
        </Button>
        <ReactEcharts
          ref={(ref) => {
            this.chart = ref
          }}
          option={this.state.option}
          style={{ height: 400 }}
        />
      </div>
    )
  }
}

export default withStyles(styles)(Monitor);
