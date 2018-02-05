import React from 'react';
import { withStyles } from 'material-ui/styles';
import Input from 'material-ui/Input';
import Select from 'material-ui/Select';
import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import AceEditor from 'react-ace';
import serializeError from 'serialize-error';
import { get } from '../../api'
import 'brace/mode/jsx';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';

const API_HOSTNAME = 'http://localhost:3000/api/v0'
const CLIENT_ID = 'some-user'

const languages = [
  'javascript',
  'json'
]

const themes = [
  'kuroir'
]

languages.forEach((lang) => {
  require(`brace/mode/${lang}`)
  require(`brace/snippets/${lang}`)
})

themes.forEach((theme) => {
  require(`brace/theme/${theme}`)
})

const styles = theme => ({
  requestContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  verbs: {
    minWidth: 30,
    marginTop: theme.spacing.unit * 2,
  },
  input: {
    margin: theme.spacing.unit,
    flexGrow: 1
  },
  button: {
    margin: theme.spacing.unit,
  },
});


class RequestBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      text: '// some text',
      verb: 'GET',
      url: `${API_HOSTNAME}/products/${CLIENT_ID}`
    }
  }

  
  componentDidMount() {

  }

  makeRequest = () => {
    const { url } = this.state

    get(url)
      .then((body) => {
        this.setState({
          text: JSON.stringify(body, null, 2)
        })
      }).catch((err) => {
        this.setState({
          text: JSON.stringify(serializeError(err), null, 2)
        })
      })
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <div className={classes.requestContainer}>
          <Select
            value={this.state.verb}
            onChange={this.handleChange}
            inputProps={{
              name: 'age',
              id: 'age-simple',
            }}
          >
            <MenuItem value='GET'>GET</MenuItem>
          </Select>
          <Input
            placeholder='URL'
            className={classes.input}
            value={this.state.url}
            onChange={e => this.setState({ url: e.target.value })}
            inputProps={{
              'aria-label': 'URL',
            }}
          />
          <Button
            variant="raised"
            color="primary"
            className={classes.button}
            onClick={this.makeRequest}
          >
            Send
          </Button>
        </div>
        <AceEditor
          mode="json"
          theme="kuroir"
          name="request-box"
          onLoad={this.onLoad}
          onChange={this.onChange}
          fontSize={14}
          showPrintMargin={false}
          showGutter={true}
          highlightActiveLine={true}
          value={this.state.text}
          setOptions={{
            enableBasicAutocompletion: false,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
      </div>
    )
  }
}

export default withStyles(styles)(RequestBox);
