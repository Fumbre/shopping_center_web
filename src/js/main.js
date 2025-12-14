const importAll = (requireContext) => requireContext.keys().forEach(requireContext);
importAll(require.context('../assets/images', true, /\.(png|jpe?g|gif|svg)$/));
import '../scss/layout.scss';
import '../scss/index.scss';
import '../scss/card.scss';
import '../scss/history.scss';
import '../scss/category-item-page.scss';
import '../scss/catalog.scss';
import '../scss/cooperation.scss';
import '../scss/contacts.scss';
import '../scss/media.scss';

import { router } from './router'

