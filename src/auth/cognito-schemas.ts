export const MetadataSchema = {
  type: 'object',
  properties: {
    httpStatusCode: {type: 'number'},
    requestId: {type: 'string'},
    extendedRequestId: {type: 'string'},
    cfId: {type: 'string'},
    attempts: {type: 'number'},
    totalRetryDelay: {type: 'number'}
  }
};

export const ResponseMetadataSchema = {
  type: 'object',
  properties: {
    $metadata: MetadataSchema
  }
};

export const MFAOptionTypeSchema = {
  type: 'object',
  properties: {
    DeliveryMedium: {type: 'string'},
    AttributeName: {type: 'string'}
  }
};

export const AttributeTypeSchema = {
  type: 'object',
  properties: {
    Name: {type: 'string'},
    Value: {type: 'string'}
  }
};

export const AdminGetUserResponseSchema = {
  type: 'object',
  properties: {
    Username: {type: 'string'},
    UserAttributes: {type: 'array', items: AttributeTypeSchema},
    UserCreateDate: {type: 'string', format: 'date-time'},
    UserLastModifiedDate: {type: 'string', format: 'date-time'},
    Enabled: {type: 'boolean'},
    UserStatus: {type: 'string'},
    MFAOptions: {type: 'array', items: MFAOptionTypeSchema},
    PreferredMfaSetting: {type: 'string'},
    UserMFASettingList: {type: 'array', items: {type: 'string'}},
    $metadata: MetadataSchema
  }
};

export const AdminCreateUserBodyRequestSchema = {
  type: 'object',
  properties: {
    UserPhone: {type: 'string'}
  }
};

export const ListUsersCommandOutputSchema = {
  type: 'object',
  properties: {
    Users: {type: 'array', items: AdminGetUserResponseSchema},
    PaginationToken: {type: 'string'},
    $metadata: MetadataSchema
  }
};
