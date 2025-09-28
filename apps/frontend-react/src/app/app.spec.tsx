import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { App } from './app';
import { store } from './store';
import { Provider } from 'react-redux';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
    expect(baseElement).toBeTruthy();
  });
});
