import React, { Component } from 'react';
import * as API from '../services/api';
import { Container } from './App.styled';
import Searchbar from './Searchbar';
import ImageGallery from './ImageGallery';
import Button from './Button';
import Loader from './Loader';
import Modal from './Modal';

const NUMBER_PER_PAGE = 12;

class App extends Component {
  state = {
    images: null,
    currentResponse: null,
    isError: null,
    isLoading: null,
    isNewPageExist: null,
    isModalShow: false,
    searchQuery: null,
    page: null,
    currentImage: null,
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      (prevState.images !== this.state.images ||
        prevState.page !== this.state.page) &&
      this.state.currentResponse !== null
    ) {
      console.log('done');
      this.isNewPageExist();
    }
  }

  getImages = async () => {
    try {
      this.setState({ isLoading: true, isError: false });
      const { searchQuery, page } = this.state;
      const response = await API.getMaterials(
        searchQuery,
        page,
        NUMBER_PER_PAGE
      );
      this.setState(prevState => {
        return {
          images: [...(prevState.images || []), ...response.hits],
          currentResponse: response,
          isLoading: false,
        };
      });
    } catch (error) {
      this.setState({ isError: true });
      console.log(error);
    }
  };

  handleSearchClick = queruValue => {
    this.setState(
      { page: 1, searchQuery: queruValue, images: null, currentResponse: null },
      () => {
        this.getImages();
      }
    );
  };

  handleMoreButtonClick = () => {
    this.setState(
      prevState => {
        return { page: prevState.page + 1 };
      },
      () => {
        this.getImages();
      }
    );
  };

  isNewPageExist = () => {
    const { page, currentResponse } = this.state;
    const result = currentResponse.totalHits - page * NUMBER_PER_PAGE > 0;
    this.setState({ isNewPageExist: result });
  };

  toggleModal = () => {
    this.setState(
      prevState => {
        return { isModalShow: !prevState.isModalShow };
      },
      () => console.log(this.state.isModalShow)
    );
  };

  getCurrentImage = image => {
    this.setState({ currentImage: image }, () => {
      console.log(this.state.currentImage);
    });
  };

  render() {
    const { images, isNewPageExist, isLoading, isModalShow } = this.state;
    return (
      <Container>
        <Searchbar onSubmit={this.handleSearchClick} />
        {images && (
          <ImageGallery
            images={images}
            showModal={this.toggleModal}
            getImage={this.getCurrentImage}
          />
        )}
        {isNewPageExist && <Button onClick={this.handleMoreButtonClick} />}
        {isLoading && <Loader />}
        {isModalShow && (
          <Modal
            alt={this.state.currentImage.tags}
            src={this.state.currentImage.largeImageURL}
            hideModal={this.toggleModal}
          />
        )}
      </Container>
    );
  }
}

export default App;
