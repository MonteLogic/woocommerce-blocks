/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	usePrevious,
	useShallowEqual,
	useBorderProps,
} from '@woocommerce/base-hooks';
import {
	useCollection,
	useQueryStateByKey,
	useQueryStateByContext,
	useCollectionData,
} from '@woocommerce/base-context/hooks';
import { useCallback, useEffect, useState, useMemo } from '@wordpress/element';
import Label from '@woocommerce/base-components/filter-element-label';
import FilterResetButton from '@woocommerce/base-components/filter-reset-button';
import FilterSubmitButton from '@woocommerce/base-components/filter-submit-button';
import isShallowEqual from '@wordpress/is-shallow-equal';
import { decodeEntities } from '@wordpress/html-entities';
import { Notice } from 'wordpress-components';
import { getSettingWithCoercion } from '@woocommerce/settings';
import { getQueryArgs, removeQueryArgs } from '@wordpress/url';
import {
	AttributeQuery,
	isAttributeQueryCollection,
	isBoolean,
	isString,
	objectHasProp,
} from '@woocommerce/types';
import { Icon, chevronDown } from '@wordpress/icons';
import {
	changeUrl,
	PREFIX_QUERY_ARG_FILTER_TYPE,
	PREFIX_QUERY_ARG_QUERY_TYPE,
} from '@woocommerce/utils';
import { difference } from 'lodash';
import FormTokenField from '@woocommerce/base-components/form-token-field';
import FilterTitlePlaceholder from '@woocommerce/base-components/filter-placeholder';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { getAttributeFromID } from '../../utils/attributes';
import { updateAttributeFilter } from '../../utils/attributes-query';
import { previewAttributeObject, previewOptions } from './preview';
import './style.scss';
import {
	formatParams,
	getActiveFilters,
	areAllFiltersRemoved,
	isQueryArgsEqual,
	parseTaxonomyToGenerateURL,
	formatSlug,
	generateUniqueId,
} from './utils';
import { BlockAttributes, DisplayOption } from './types';
import CheckboxFilter from './checkbox-filter';


import { useStoreProducts } from '@woocommerce/base-context/hooks';


/**
 * Formats filter values into a string for the URL parameters needed for filtering PHP templates.
 *
 * @param {string} url    Current page URL.
 * @param {Array}  params Parameters and their constraints.
 *
 * @return {string}       New URL with query parameters in it.
 */

/**
 * Component displaying an attribute filter.
 *
 * @param {Object}  props            Incoming props for the component.
 * @param {Object}  props.attributes Incoming block attributes.
 * @param {boolean} props.isEditor
 */
const AttributeFilterBlock = ( {
	attributes: blockAttributes,
	isEditor = false,
}: {
	attributes: BlockAttributes;
	isEditor?: boolean;
} ) => {
	const hasFilterableProducts = getSettingWithCoercion(
		'has_filterable_products',
		false,
		isBoolean
	);

	const filteringForPhpTemplate = getSettingWithCoercion(
		'is_rendering_php_template',
		false,
		isBoolean
	);

	const pageUrl = getSettingWithCoercion(
		'page_url',
		window.location.href,
		isString
	);

	const [ hasSetFilterDefaultsFromUrl, setHasSetFilterDefaultsFromUrl ] =
		useState( false );

	const attributeObject =
		blockAttributes.isPreview && ! blockAttributes.attributeId
			? previewAttributeObject
			: getAttributeFromID( blockAttributes.attributeId );



	const initialFilters = useMemo(
		() => getActiveFilters( attributeObject ),
		[ attributeObject ]
	);
	// console.log(initialFilters);

	const [ checked, setChecked ] = useState( initialFilters );

	/*
		FormTokenField forces the dropdown to reopen on reset, so we create a unique ID to use as the components key.
		This will force the component to remount on reset when we change this value.
		More info: https://github.com/woocommerce/woocommerce-blocks/pull/6920#issuecomment-1222402482
	 */
	const [ remountKey, setRemountKey ] = useState( generateUniqueId() );


	const [ displayedOptions, setDisplayedOptions ] = useState<
		DisplayOption[]
	>(
		blockAttributes.isPreview && ! blockAttributes.attributeId
			? previewOptions
			: []
	);

	const borderProps = useBorderProps( blockAttributes );

	const [ queryState ] = useQueryStateByContext();
	const [ productAttributesQuery, setProductAttributesQuery ] =
		useQueryStateByKey( 'attributes', [] );

		// This is where the products ON screen are queried and logged. 
	const { products, totalProducts, productsLoading } =
	useStoreProducts( queryState );

	console.log(products);
	//console.log(totalProducts);

	const [ customOptions ] = products;







	
	//	attributeTerms is declared here. 
	const { results: attributeTerms, isLoading: attributeTermsLoading } =
		useCollection( {
			// We know that results are unknown and isLoading is a boolean.
			// So I'm guessing the attributeTerms are results returned from
			// the useCollection object. 

			namespace: '/wc/store/v1',
			resourceName: 'products/attributes/terms',
			// What is the attributeObject
			resourceValues: [ attributeObject?.id || 0 ],
			shouldSelect: blockAttributes.attributeId > 0,
		} );




	// Why use the below two consts?
	const filterAvailableTerms =
		blockAttributes.displayStyle !== 'dropdown' &&
		blockAttributes.queryType === 'and';
	const { results: filteredCounts, isLoading: filteredCountsLoading } =
		useCollectionData( {
			queryAttribute: {
				taxonomy: attributeObject?.taxonomy || '',
				queryType: blockAttributes.queryType,
			},
			queryState: {
				...queryState,
				attributes: filterAvailableTerms ? queryState.attributes : null,
			},
		} );

	/**
	 * Get count data about a given term by ID.
	 */
	const getFilteredTerm = useCallback(
		( id ) => {
			if (
				! objectHasProp( filteredCounts, 'attribute_counts' ) ||
				! Array.isArray( filteredCounts.attribute_counts )
			) {
				return null;
			}
			return filteredCounts.attribute_counts.find(
				( { term } ) => term === id
			);
		},
		[ filteredCounts ]
	);

	// This appears to output a function. 
	// console.log(getFilteredTerm);

	/**
	 * Compare intersection of all terms and filtered counts to get a list of options to display.
	 */
	useEffect( () => {
		/**
		 * Checks if a term slug is in the query state.
		 *
		 * @param {string} termSlug The term of the slug to check.
		 */
		const isTermInQueryState = ( termSlug: string ) => {
			if ( ! queryState?.attributes ) {
				return false;
			}
			return queryState.attributes.some(
				( { attribute, slug = [] }: AttributeQuery ) =>
					attribute === attributeObject?.taxonomy &&
					slug.includes( termSlug )
			);
		};

		if ( attributeTermsLoading || filteredCountsLoading ) {
			return;
		}

		if ( ! Array.isArray( attributeTerms ) ) {
			return;
		}


		const newOptions = attributeTerms
			// This is a map function which is pretty much a loop function. 
			// What is the term param/var?
			.map( ( term ) => {
				// This outputs an object such as:
				//	Object { id: 43, name: "Blue", slug: "blue", description: "", parent: 0, count: 30 }			​
				// I think term may be a value of attributeTerms. 
				// It appears term is just a 'leapfrog' var.





				const filteredTerm = getFilteredTerm( term.id );
				//console.log(filteredTerm);
				// Outputs:
				// Object { term: 225, count: 2 }
				// So I guess term is a number which correlates to an attribute name.
				// console.log(term.slug);


				
				console.log( isTermInQueryState( term.slug ));

				// If there is no match this term doesn't match the current product collection - only render if checked.
				if (
					! filteredTerm &&
					! checked.includes( term.slug ) &&
					! isTermInQueryState( term.slug )
				) {
					return null;
				}

				// THIS is the number which is being displayed. 
				const count = filteredTerm ? filteredTerm.count : 0;

				return {
					formattedValue: formatSlug( term.slug ),
					value: term.slug,
					name: decodeEntities( term.name ),
					label: (
						<Label
							name={ decodeEntities( term.name ) }
							// Okay, so the line below is what shows the count of each arrtibute.
							// showCounts is a boolean, if it evaluates false then the component 
							// is going to output the count variable. 
							count={ blockAttributes.showCounts ? count : null }
						/>
					),
					textLabel: blockAttributes.showCounts
						? `${ decodeEntities( term.name ) } (${ count })`
						: decodeEntities( term.name ),
				};
			} )
			.filter( ( option ): option is DisplayOption => !! option );

		setDisplayedOptions( newOptions );
		setRemountKey( generateUniqueId() );
	}, [
		attributeObject?.taxonomy,
		attributeTerms,
		attributeTermsLoading,
		blockAttributes.showCounts,
		filteredCountsLoading,
		getFilteredTerm,
		checked,
		queryState.attributes,
	] );

	/**
	 * Returns an array of term objects that have been chosen via the checkboxes.
	 */
	const getSelectedTerms = useCallback(
		( newChecked ) => {
			if ( ! Array.isArray( attributeTerms ) ) {
				return [];
			}
			return attributeTerms.reduce( ( acc, term ) => {
				if ( newChecked.includes( term.slug ) ) {
					acc.push( term );
				}
				return acc;
			}, [] );
		},
		[ attributeTerms ]
	);

	/**
	 * Appends query params to the current pages URL and redirects them to the new URL for PHP rendered templates.
	 *
	 * @param {Object}  query             The object containing the active filter query.
	 * @param {boolean} allFiltersRemoved If there are active filters or not.
	 */
	const updateFilterUrl = useCallback(
		( query, allFiltersRemoved = false ) => {
			if ( allFiltersRemoved ) {
				if ( ! attributeObject?.taxonomy ) {
					return;
				}
				const currentQueryArgKeys = Object.keys(
					getQueryArgs( window.location.href )
				);

				const parsedTaxonomy = parseTaxonomyToGenerateURL(
					attributeObject.taxonomy
				);

				const url = currentQueryArgKeys.reduce(
					( currentUrl, queryArg ) =>
						queryArg.includes(
							PREFIX_QUERY_ARG_QUERY_TYPE + parsedTaxonomy
						) ||
						queryArg.includes(
							PREFIX_QUERY_ARG_FILTER_TYPE + parsedTaxonomy
						)
							? removeQueryArgs( currentUrl, queryArg )
							: currentUrl,
					window.location.href
				);

				const newUrl = formatParams( url, query );
				changeUrl( newUrl );
			} else {
				const newUrl = formatParams( pageUrl, query );
				const currentQueryArgs = getQueryArgs( window.location.href );
				const newUrlQueryArgs = getQueryArgs( newUrl );

				if ( ! isQueryArgsEqual( currentQueryArgs, newUrlQueryArgs ) ) {
					changeUrl( newUrl );
				}
			}
		},
		[ pageUrl, attributeObject?.taxonomy ]
	);

	const onSubmit = ( checkedFilters: string[] ) => {
		const query = updateAttributeFilter(
			productAttributesQuery,
			setProductAttributesQuery,
			attributeObject,
			getSelectedTerms( checkedFilters ),
			blockAttributes.queryType === 'or' ? 'in' : 'and'
		);

		updateFilterUrl( query, checkedFilters.length === 0 );
	};

	const updateCheckedFilters = useCallback(
		( checkedFilters: string[], force = false ) => {
			if ( isEditor ) {
				return;
			}

			setChecked( checkedFilters );
			if ( force || ! blockAttributes.showFilterButton ) {
				updateAttributeFilter(
					productAttributesQuery,
					setProductAttributesQuery,
					attributeObject,
					getSelectedTerms( checkedFilters ),
					blockAttributes.queryType === 'or' ? 'in' : 'and'
				);
			}
		},
		[
			isEditor,
			setChecked,
			productAttributesQuery,
			setProductAttributesQuery,
			attributeObject,
			getSelectedTerms,
			blockAttributes.queryType,
			blockAttributes.showFilterButton,
		]
	);

	const checkedQuery = useMemo( () => {
		if ( ! isAttributeQueryCollection( productAttributesQuery ) ) {
			return [];
		}

		return productAttributesQuery
			.filter(
				( { attribute } ) => attribute === attributeObject?.taxonomy
			)
			.flatMap( ( { slug } ) => slug );
	}, [ productAttributesQuery, attributeObject?.taxonomy ] );

	const currentCheckedQuery = useShallowEqual( checkedQuery );
	const previousCheckedQuery = usePrevious( currentCheckedQuery );
	// Track ATTRIBUTES QUERY changes so the block reflects current filters.
	useEffect( () => {
		if (
			previousCheckedQuery &&
			! isShallowEqual( previousCheckedQuery, currentCheckedQuery ) && // checked query changed
			! isShallowEqual( checked, currentCheckedQuery ) // checked query doesn't match the UI
		) {
			updateCheckedFilters( currentCheckedQuery );
		}
	}, [
		checked,
		currentCheckedQuery,
		previousCheckedQuery,
		updateCheckedFilters,
	] );

	const multiple = blockAttributes.selectType !== 'single';

	/**
	 * When a checkbox in the list changes, update state.
	 */
	const onChange = useCallback(
		( checkedValue ) => {
			const previouslyChecked = checked.includes( checkedValue );
			let newChecked;

			if ( ! multiple ) {
				newChecked = previouslyChecked ? [] : [ checkedValue ];
			} else {
				newChecked = checked.filter(
					( value ) => value !== checkedValue
				);

				if ( ! previouslyChecked ) {
					newChecked.push( checkedValue );
					newChecked.sort();
				}
			}

			updateCheckedFilters( newChecked );
		},
		[ checked, multiple, updateCheckedFilters ]
	);

	/**
	 * Update the filter URL on state change.
	 */
	useEffect( () => {
		if ( ! attributeObject || blockAttributes.showFilterButton ) {
			return;
		}

		if (
			areAllFiltersRemoved( {
				currentCheckedFilters: checked,
				hasSetFilterDefaultsFromUrl,
			} )
		) {
			updateFilterUrl( productAttributesQuery, true );
		} else {
			updateFilterUrl( productAttributesQuery, false );
		}
	}, [
		hasSetFilterDefaultsFromUrl,
		updateFilterUrl,
		productAttributesQuery,
		attributeObject,
		checked,
		blockAttributes.showFilterButton,
	] );

	/**
	 * Try to get the current attribute filter from the URl.
	 */
	useEffect( () => {
		if ( hasSetFilterDefaultsFromUrl || attributeTermsLoading ) {
			return;
		}

		if ( initialFilters.length > 0 ) {
			setHasSetFilterDefaultsFromUrl( true );
			updateCheckedFilters( initialFilters, true );
			return;
		}

		if ( ! filteringForPhpTemplate ) {
			setHasSetFilterDefaultsFromUrl( true );
		}
	}, [
		attributeObject,
		hasSetFilterDefaultsFromUrl,
		attributeTermsLoading,
		updateCheckedFilters,
		initialFilters,
		filteringForPhpTemplate,
	] );

	if ( ! hasFilterableProducts ) {
		return null;
	}

	// Short-circuit if no attribute is selected.
	if ( ! attributeObject ) {
		if ( isEditor ) {
			return (
				<Notice status="warning" isDismissible={ false }>
					<p>
						{ __(
							'Please select an attribute to use this filter!',
							'woo-gutenberg-products-block'
						) }
					</p>
				</Notice>
			);
		}
		return null;
	}

	if ( displayedOptions.length === 0 && ! attributeTermsLoading ) {
		if ( isEditor ) {
			return (
				<Notice status="warning" isDismissible={ false }>
					<p>
						{ __(
							'There are no products with the selected attributes.',
							'woo-gutenberg-products-block'
						) }
					</p>
				</Notice>
			);
		}
	}

	const TagName =
		`h${ blockAttributes.headingLevel }` as keyof JSX.IntrinsicElements;
	const termsLoading = ! blockAttributes.isPreview && attributeTermsLoading;
	const countsLoading = ! blockAttributes.isPreview && filteredCountsLoading;

	const isLoading =
		( termsLoading || countsLoading ) && displayedOptions.length === 0;

	if ( ! isLoading && displayedOptions.length === 0 ) {
		return null;
	}

	const heading = (
		<TagName className="wc-block-attribute-filter__title">
			{ blockAttributes.heading }
		</TagName>
	);

	const filterHeading = isLoading ? (
		<FilterTitlePlaceholder>{ heading }</FilterTitlePlaceholder>
	) : (
		heading
	);

	return (
		<>
			{ ! isEditor && blockAttributes.heading && filterHeading }
			<div
				className={ classnames(
					'wc-block-attribute-filter',
					`style-${ blockAttributes.displayStyle }`
				) }
			>
				{ blockAttributes.displayStyle === 'dropdown' ? (
					<>
						<FormTokenField
							key={ remountKey }
							className={ classnames( borderProps.className, {
								'single-selection': ! multiple,
								'is-loading': isLoading,
							} ) }
							style={ {
								...borderProps.style,
								borderStyle: 'none',
							} }
							suggestions={ displayedOptions
								.filter(
									( option ) =>
										! checked.includes( option.value )
								)
								.map( ( option ) => option.formattedValue ) }
							disabled={ isLoading }
							placeholder={ sprintf(
								/* translators: %s attribute name. */
								__(
									'Select %s',
									'woo-gutenberg-products-block'
								),
								attributeObject.label
							) }
							onChange={ ( tokens: string[] ) => {
								if ( ! multiple && tokens.length > 1 ) {
									tokens = [ tokens[ tokens.length - 1 ] ];
								}

								tokens = tokens.map( ( token ) => {
									const displayOption = displayedOptions.find(
										( option ) =>
											option.formattedValue === token
									);

									return displayOption
										? displayOption.value
										: token;
								} );

								const added = difference( tokens, checked );

								if ( added.length === 1 ) {
									return onChange( added[ 0 ] );
								}

								const removed = difference( checked, tokens );
								if ( removed.length === 1 ) {
									onChange( removed[ 0 ] );
								}
							} }
							value={ checked }
							displayTransform={ ( value: string ) => {
								const result = displayedOptions.find(
									( option ) =>
										[
											option.value,
											option.formattedValue,
										].includes( value )
								);
								return result ? result.textLabel : value;
							} }
							saveTransform={ formatSlug }
							messages={ {
								added: sprintf(
									/* translators: %s is the attribute label. */
									__(
										'%s filter added.',
										'woo-gutenberg-products-block'
									),
									attributeObject.label
								),
								removed: sprintf(
									/* translators: %s is the attribute label. */
									__(
										'%s filter removed.',
										'woo-gutenberg-products-block'
									),
									attributeObject.label
								),
								remove: sprintf(
									/* translators: %s is the attribute label. */
									__(
										'Remove %s filter.',
										'woo-gutenberg-products-block'
									),
									attributeObject.label.toLocaleLowerCase()
								),
								__experimentalInvalid: sprintf(
									/* translators: %s is the attribute label. */
									__(
										'Invalid %s filter.',
										'woo-gutenberg-products-block'
									),
									attributeObject.label.toLocaleLowerCase()
								),
							} }
						/>
						{ multiple && (
							<Icon icon={ chevronDown } size={ 30 } />
						) }
					</>
				) : (
					// If this is commented out the filters won't load. 
					<CheckboxFilter
						options={ displayedOptions }
						checked={ checked }
						onChange={ onChange }
						isLoading={ isLoading }
						isDisabled={ isLoading }
					/>
				)
				
				
				
				}
			</div>
			<div className='second-filter-block'> 
				<div>Start block which shows data of products on screen.</div>

					<CheckboxFilter
					// Okay, so I have to work on 
					// my own displayedOptions.
					// When I comment 
						options={ displayedOptions }
						checked={ checked }
						onChange={ onChange }
						isLoading={ isLoading }
						isDisabled={ isLoading }
					/>

			</div>











			<div className="wc-block-attribute-filter__actions">
				{ checked.length > 0 && ! isLoading && (
					<FilterResetButton
						onClick={ () => {
							setChecked( [] );
							setRemountKey( generateUniqueId() );
							if ( hasSetFilterDefaultsFromUrl ) {
								onSubmit( [] );
							}
						} }
						screenReaderLabel={ __(
							'Reset attribute filter',
							'woo-gutenberg-products-block'
						) }
					/>
				) }
				{ blockAttributes.showFilterButton && (
					<FilterSubmitButton
						className="wc-block-attribute-filter__button"
						isLoading={ isLoading }
						disabled={
							termsLoading ||
							countsLoading ||
							checked.length === 0
						}
						onClick={ () => onSubmit( checked ) }
					/>
				) }
			</div>
		</>
	);
};

export default AttributeFilterBlock;
