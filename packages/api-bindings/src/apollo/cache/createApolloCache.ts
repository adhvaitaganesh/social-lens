import {
  ApolloCache,
  InMemoryCache,
  NormalizedCacheObject,
  FieldFunctionOptions,
  FieldPolicy,
  TypePolicy as UnpatchedTypePolicy,
  ReactiveVar,
} from '@apollo/client';
import { WalletData } from '@lens-protocol/domain/use-cases/wallets';
import { Overwrite } from '@lens-protocol/shared-kernel';

import generatedIntrospection from '../../graphql/generated';
import { createAttributeTypePolicy } from './createAttributeTypePolicy';
import { createExploreProfilesFieldPolicy } from './createExploreProfileFieldPolicy';
import { createExplorePublicationsFieldPolicy } from './createExplorePublicationsFieldPolicy';
import { createFeedFieldPolicy } from './createFeedFieldPolicy';
import { createMediaSetTypePolicy } from './createMediaSetTypePolicy';
import { createMediaTypePolicy } from './createMediaTypePolicy';
import { createNftImageTypePolicy } from './createNftImageTypePolicy';
import { createNotificationsFieldPolicy } from './createNotificationsFieldPolicy';
import { createProfileFollowersFieldPolicy } from './createProfileFollowersFieldPolicy';
import { createProfileFollowingFieldPolicy } from './createProfileFollowingFieldPolicy';
import { createProfilePublicationRevenueFieldPolicy } from './createProfilePublicationRevenueFieldPolicy';
import { createProfilePublicationsForSaleFieldPolicy } from './createProfilePublicationsForSaleFieldPolicy';
import { createProfileTypePolicy } from './createProfileTypePolicy';
import { createProfilesFieldPolicy } from './createProfilesFieldPolicy';
import { createPublicationsFieldPolicy } from './createPublicationsFieldPolicy';
import { createRevenueAggregateTypePolicy } from './createRevenueAggregateTypePolicy';
import { createSearchFieldPolicy } from './createSearchFieldPolicy';
import { createWhoReactedPublicationFieldPolicy } from './createWhoReactedPublicationFieldPolicy';
import { createContentPublicationTypePolicy } from './publicationTypePolicy';
import { noCachedField } from './utils/noCachedField';
import { notNormalizedType } from './utils/notNormalizedType';

type TypedFieldFunctionOptions<TAll> = Overwrite<
  FieldFunctionOptions,
  {
    readField: <T extends keyof NO, O = TAll, NO = NonNullable<O>>(
      fieldName: T,
      from?: O,
    ) => Readonly<NO[T]> | undefined;
  }
>;

type TypedFieldReadFunction<TExisting, TAll> = (
  existing: Readonly<TExisting> | undefined,
  options: TypedFieldFunctionOptions<TAll>,
) => TExisting | undefined;

export type TypePolicy<T> = Overwrite<
  UnpatchedTypePolicy,
  {
    fields?: Partial<{
      [key in keyof T]: FieldPolicy<T[key]> | TypedFieldReadFunction<T[key], T>;
    }>;
  }
>;

type TypePolicies = {
  [__typename: string]: TypePolicy<unknown>;
};

type TypePoliciesArgs = {
  activeWalletVar: ReactiveVar<WalletData | null>;
};

function createTypePolicies({ activeWalletVar }: TypePoliciesArgs): TypePolicies {
  return {
    Profile: createProfileTypePolicy(activeWalletVar),
    Post: createContentPublicationTypePolicy(),
    Comment: createContentPublicationTypePolicy(),

    FeedItem: notNormalizedType(),

    MetadataOutput: notNormalizedType(),
    PublicationStats: notNormalizedType({
      fields: {
        commentsTotal: noCachedField(),
      },
    }),
    ProfileStats: notNormalizedType({
      fields: {
        commentsTotal: noCachedField(),
        postsTotal: noCachedField(),
        mirrorsTotal: noCachedField(),
      },
    }),

    AccessConditionOutput: notNormalizedType(),
    EncryptionParamsOutput: notNormalizedType(),

    Attribute: createAttributeTypePolicy(),
    MediaSet: createMediaSetTypePolicy(),
    NftImage: createNftImageTypePolicy(),
    Media: createMediaTypePolicy(),

    RevenueAggregate: createRevenueAggregateTypePolicy(),

    Query: {
      fields: {
        feed: createFeedFieldPolicy(),
        exploreProfiles: createExploreProfilesFieldPolicy(),
        explorePublications: createExplorePublicationsFieldPolicy(),
        notifications: createNotificationsFieldPolicy(),
        profiles: createProfilesFieldPolicy(),
        profilePublicationsForSale: createProfilePublicationsForSaleFieldPolicy(),
        publications: createPublicationsFieldPolicy(),
        search: createSearchFieldPolicy(),
        whoReactedPublication: createWhoReactedPublicationFieldPolicy(),
        followers: createProfileFollowersFieldPolicy(),
        following: createProfileFollowingFieldPolicy(),
        profilePublicationRevenue: createProfilePublicationRevenueFieldPolicy(),
      },
    },
  };
}

export function createApolloCache({
  activeWalletVar,
}: TypePoliciesArgs): ApolloCache<NormalizedCacheObject> {
  return new InMemoryCache({
    possibleTypes: generatedIntrospection.possibleTypes,
    resultCaching: true,
    typePolicies: createTypePolicies({ activeWalletVar }),
  });
}