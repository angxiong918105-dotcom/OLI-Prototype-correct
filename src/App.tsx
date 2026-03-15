/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Module from './pages/Module';
import Reflection from './pages/Reflection';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="module/:id" element={<Module />} />
          <Route path="reflection/:id" element={<Reflection />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
