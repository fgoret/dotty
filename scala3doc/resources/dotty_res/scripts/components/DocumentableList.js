/**
 * @typedef { import("./Filter").Filter } Filter
 */

class DocumentableList extends Component {
  constructor(props) {
    super(props);

    this.refs = {
      tabs: findRefs(".section-tab[data-togglable]", findRef(".tabbedcontent")),
      sections: findRefs("div[data-togglable]", findRef(".tabbedcontent")),
    };

    this.state = {
      list: new List(this.refs.tabs, this.refs.sections),
    };

    this.render(this.props);
  }

  toggleElementDatasetVisibility(isVisible, ref) {
    ref.dataset.visibility = isVisible
  }

  toggleDisplayStyles(condition, ref, onVisibleStyle) {
    ref.style.display = condition ? onVisibleStyle : 'none'
  }

  render({ filter }) {
    this.state.list.sectionsRefs.map(sectionRef => {
      const tabRef = this.state.list.getTabRefFromSectionRef(sectionRef);

      const isTabVisible = this.state.list
        .getSectionListRefs(sectionRef)
        .filter((listRef) => {
          const isListVisible = this.state.list
            .getSectionListElementsRefs(listRef)
            .map(elementRef => this.state.list.toListElement(elementRef))
            .filter(elementData => {
              const isElementVisible = this.state.list.isElementVisible(elementData, filter);

              this.toggleDisplayStyles(isElementVisible, elementData.ref, "table");
              this.toggleElementDatasetVisibility(isElementVisible, elementData.ref);

              return isElementVisible;
            }).length;

          this.toggleDisplayStyles(isListVisible, listRef, "block");

          return isListVisible;
        }).length;

      this.toggleDisplayStyles(isTabVisible, tabRef, "inline-block");
    });
  }
}

/**
 * @typedef { { ref: Element; name: string; description: string } } ListElement
 */

class List { 
  /**
   * @param tabsRef { Element[] }
   * @param sectionRefs { Element[] }
   */
  constructor(tabsRef, sectionRefs) {
    this._tabsRef = tabsRef;
    this._sectionRefs = sectionRefs;
  }

  get tabsRefs() {
    return this._tabsRef.filter(tabRef => this.filterTab(this._getTogglable(tabRef)));
  }

  get sectionsRefs() {
    return this._sectionRefs.filter(sectionRef => this.filterTab(this._getTogglable(sectionRef)));
  }

  /**
  * @param name { string }
  */
  filterTab(name) { 
    return name !== "Linear supertypes" && name !== "Known subtypes" && name !== "Type hierarchy"
  }

  /**
   * @param sectionRef { Element }
   */
  getTabRefFromSectionRef(sectionRef) {
    return this.tabsRefs.find(
      (tabRef) => this._getTogglable(tabRef) === this._getTogglable(sectionRef)
    );
  }

  /**
   * @param sectionRef { Element }
   * @returns { Element[] }
   */
  getSectionListRefs(sectionRef) {
    return findRefs(".documentableList", sectionRef);
  }

  /**
   * @param listRef { Element }
   * @returns { Element[] }
   */
  getSectionListElementsRefs(listRef) {
    return findRefs(".documentableElement", listRef);
  }

  /**
   * @param elementRef { Element }
   * @returns { ListElement }
   */
  toListElement(elementRef) {
    return {
      ref: elementRef,
      name: getElementTextContent(getElementNameRef(elementRef)),
      description: getElementTextContent(getElementDescription(elementRef)),
    };
  }

  /**
  * @param elementData { ListElement }
  * @param filter { Filter }
  */
  isElementVisible(elementData, filter) {
    if (!areFiltersFromElementSelected(elementData, filter)) {
      return false;
    } else {
      return includesInputValue(elementData, filter);
    }

    function includesInputValue() {
      return elementData.name.includes(filter.value) || elementData.description.includes(filter.value);
    }

    function areFiltersFromElementSelected() {
      /** @type {[key: string, value: string][]} */
      const dataset = Object.entries(elementData.ref.dataset).filter(([key]) => startsWith(key, "f"));

      const hasCorrespondingFilters = () =>
        dataset.every(([key, value]) => {
          const filterGroup = filter.filters[key];
          return value.split(",").every(val => filterGroup && filterGroup[val].selected);
        });

      return dataset.length ? hasCorrespondingFilters() : true;
    }
  }

  /**
  * @param elementData { ListElement }
  */
  _getTogglable = elementData => elementData.dataset.togglable;
}

