import styles from 'main.scss';

export default (text = 'Hello world') => {
  const element = document.createElement('div');

  element.innerHTML = text;

  // Attach the generated class name
  element.className = styles.redButton;

  return element;
};
