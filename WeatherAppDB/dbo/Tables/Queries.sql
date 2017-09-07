CREATE TABLE [dbo].[Queries] (
    [Id]     INT            IDENTITY (1125, 3) NOT NULL,
    [Query]  NVARCHAR (256) NOT NULL,
    [UserId] INT            NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);
