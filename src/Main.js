import React, {Component} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {Container, Text, Body, Card, CardItem} from 'native-base';
import moment from 'moment';

const URL = 'https://hn.algolia.com/api/v1/search_by_date?tags=story';
export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      loading: false,
      errorText: '',
      data: [],
      single: false,
      singleData: [],
    };
    this.mount = true;
  }
  componentDidMount() {
    let that = this;
    this.getPost();
    this.setInterval = setInterval(function () {
      that.getPost();
    }, 10000);
  }

  componentWillUnmount() {
    this.mount = false;
    clearInterval(this.setInterval);
  }

  getPost = () => {
    const {page, data} = this.state;
    if (this.mount) {
      fetch(URL + '&page=' + page)
        .then((response) => response.json())
        .then((res) => {
          this.setState({
            data: data.concat(res.hits),
            page: page + 1,
          });
        })
        .catch((err) => {
          this.setState({
            loading: false,
            error: true,
            errorText: err.toString(),
          });
        });
    }
  };

  loadMore() {
    const {page} = this.state;
    this.getPost(page + 1);
  }

  singlePost = () => {
    const {singleData} = this.state;

    return (
      <Modal
        visible={true}
        onRequestClose={() => {
          this.setState({single: false, singleData: []});
        }}>
        <Card>
          <CardItem>
            <Body>
              <Text>{JSON.stringify(singleData)}</Text>
            </Body>
          </CardItem>
        </Card>
      </Modal>
    );
  };
  renderItem(data) {
    const {item} = data;
    let author = item.author.toUpperCase();
    return (
      <Card key={item.objectID} style={styles.Card}>
        <CardItem
          style={styles.CardItem}
          button
          onPress={() =>
            this.setState({
              single: true,
              singleData: item,
            })
          }>
          <Body>
            <View style={styles.titleView}>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <Text style={styles.url}>{item.url}</Text>
          </Body>
        </CardItem>
        <CardItem style={styles.CardItem}>
          <Body>
            <Text style={styles.author}>Author: {author}</Text>
            <Text style={styles.created}>
              Created On: {moment(item.created_at).format('DD/MM/YYYY')}
            </Text>
          </Body>
        </CardItem>
      </Card>
    );
  }

  render() {
    console.log(this.state);
    return (
      <Container style={styles.Container}>
        {this.state.single ? (
          this.singlePost()
        ) : (
          <FlatList
            onEndReached={this.loadMore()}
            onEndReachedThreshold={0.5}
            data={this.state.data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={(data) => this.renderItem(data)}
            ListFooterComponent={
              <ActivityIndicator
                animating
                color={'#000'}
                style={styles.ActivityIndicator}
              />
            }
          />
        )}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  Container: {
    paddingHorizontal: 5,
    paddingTop: 5,
  },
  CardItem: {
    backgroundColor: '#dbcbbd',
  },
  titleView: {
    paddingBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  url: {
    fontSize: 13,
    color: 'blue',
  },
  author: {
    fontSize: 16,
    color: '#41444b',
  },
  created: {
    fontSize: 16,
    color: '#aa4a30',
  },
  ActivityIndicator: {
    marginBottom: 10,
    marginTop: 10,
  },
});
