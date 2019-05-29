import deformatDocument from '../../../../../src/domain/services/document/deformatDocument';

describe('Domain :: Services :: Document :: deformatDocument', () => {

  const expectedIO = (input: string, expectedOutput: string) => {
    return async (done: any) => {
      try {
        const result = deformatDocument(
          input
        );

        expect(result).toBe(expectedOutput);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    };
  };

  test(
    'Should return only the numbers from a masked CPF',
    expectedIO('155.023.820-52', '15502382052')
  );

  test(
    'Shouldn\'t remove letters',
    expectedIO('343.745.890-XX', '343745890XX')
  );

  test(
    'Should work as well for CNPJ removing also the slash',
    expectedIO('28.252.392/0001-03', '28252392000103')
  );

  test(
    'Should work also removing BACKslashes',
    expectedIO('28.252.392\\0001-03', '28252392000103')
  );

  test(
    'Shouldn\'t change the input if it only has numbers',
    expectedIO('30084847000162', '30084847000162')
  );

  test(
    'Should return empty string its input is undefined',
    expectedIO(undefined, '')
  );

});
